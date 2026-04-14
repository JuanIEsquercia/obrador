import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor, obtenerUsuario } from '@/lib/supabase/servidor'
import { formatearFecha, diasRestantes } from '@/lib/utils'
import FormularioCotizacion from './formulario-cotizacion'
import type { LineaPedido, Cotizacion, LineaCotizacion, FamiliaProducto } from '@/types'

export const metadata = { title: 'Detalle del Pedido' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaCotizarPedido({ params }: Props) {
  const { id } = await params
  const user = await obtenerUsuario()
  if (!user) redirect('/login')

  const supabase = await crearClienteServidor()

  // Pedido + los 3 recursos independientes en paralelo
  const [{ data: pedido }, { data: lineas }, { data: cotizacionExistente }, { data: misF }] =
    await Promise.all([
      supabase
        .from('pedidos')
        .select('*, comprador:perfiles(nombre, empresa, telefono)')
        .eq('id', id)
        .in('estado', ['publicado', 'cerrado'])
        .single(),
      supabase
        .from('lineas_pedido')
        .select('*, familia:familias_producto(id, nombre)')
        .eq('pedido_id', id)
        .order('orden'),
      supabase
        .from('cotizaciones')
        .select('*, lineas:lineas_cotizacion(*)')
        .eq('pedido_id', id)
        .eq('vendedor_id', user.id)
        .single(),
      supabase
        .from('vendedor_familias')
        .select('familia_id')
        .eq('vendedor_id', user.id),
    ])

  if (!pedido) notFound()

  const misFamiliaIds = new Set((misF ?? []).map(f => f.familia_id))

  // Agrupar todas las familias del pedido para el resumen
  const familias = Array.from(
    new Map(
      (lineas as LineaPedido[]).map(l => [l.familia_id, l.familia as FamiliaProducto])
    ).entries()
  )

  const comprador = pedido.comprador as { nombre: string; empresa: string; telefono: string | null }
  const esCerrado = pedido.estado === 'cerrado'
  const esGanador = cotizacionExistente?.ganadora === true

  const diasParaCierre = pedido.fecha_cierre_cotizaciones
    ? diasRestantes(pedido.fecha_cierre_cotizaciones)
    : null
  const plazoVencido = diasParaCierre !== null && diasParaCierre < 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={esCerrado ? '/vendedor/cotizaciones' : '/vendedor/pedidos'}
          className="text-sm text-on-surface-variant hover:text-on-surface"
        >
          ← {esCerrado ? 'Mis cotizaciones' : 'Pedidos disponibles'}
        </Link>

        <div className="mt-2">
          <h1 className="text-2xl font-bold text-on-surface">{pedido.titulo}</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{comprador.empresa}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant mt-1">
            <span>📍 {pedido.direccion_entrega}</span>
            <span>📅 Entrega requerida: {formatearFecha(pedido.fecha_entrega)}</span>
          </div>
          {pedido.descripcion && (
            <p className="mt-2 text-sm text-on-surface-variant bg-surface-container rounded-lg p-3">
              {pedido.descripcion}
            </p>
          )}
        </div>

        {/* Banner de plazo de cotización */}
        {!esCerrado && pedido.fecha_cierre_cotizaciones && (
          <div className={`mt-3 px-4 py-3 rounded-2xl flex items-center gap-3 ${
            plazoVencido
              ? 'bg-error-container/40 border border-error/20'
              : diasParaCierre! <= 2
                ? 'bg-tertiary-container/40 border border-tertiary/20'
                : 'bg-surface-container border border-outline-variant/30'
          }`}>
            <span className={`material-symbols-outlined flex-shrink-0 ${
              plazoVencido ? 'text-error' : diasParaCierre! <= 2 ? 'text-tertiary' : 'text-primary'
            }`}>
              schedule
            </span>
            <div>
              {plazoVencido ? (
                <>
                  <p className="text-sm font-bold text-error">Plazo de cotización vencido</p>
                  <p className="text-xs text-on-surface-variant">
                    El período de cotización cerró el {formatearFecha(pedido.fecha_cierre_cotizaciones)}
                  </p>
                </>
              ) : diasParaCierre === 0 ? (
                <>
                  <p className="text-sm font-bold text-on-surface">Último día para cotizar</p>
                  <p className="text-xs text-on-surface-variant">
                    El período cierra hoy · {formatearFecha(pedido.fecha_cierre_cotizaciones)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-on-surface">
                    Podés cotizar hasta el {formatearFecha(pedido.fecha_cierre_cotizaciones)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {diasParaCierre === 1
                      ? 'Queda 1 día para enviar tu oferta'
                      : `Quedan ${diasParaCierre} días para enviar tu oferta`}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Banner ganador con datos de contacto */}
        {esGanador && (
          <div className="mt-4 p-4 bg-primary-fixed/30 border-2 border-primary rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined icon-fill text-primary text-2xl flex-shrink-0 mt-0.5">emoji_events</span>
            <div>
              <p className="font-bold text-primary">¡Ganaste esta licitación!</p>
              <p className="text-sm text-on-surface mt-0.5">
                Contactate con <strong>{comprador.nombre}</strong> de {comprador.empresa} para coordinar la entrega.
              </p>
              {comprador.telefono && (
                <a
                  href={`tel:${comprador.telefono}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-base">phone</span>
                  {comprador.telefono}
                </a>
              )}
              {!comprador.telefono && (
                <p className="text-xs text-on-surface-variant mt-1">El comprador no registró teléfono de contacto.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resumen del pedido */}
      <div className="tarjeta mb-5">
        <h2 className="font-semibold text-on-surface mb-4">Ítems del pedido</h2>
        <div className="space-y-5">
          {familias.map(([familia_id, familia]) => {
            const items = (lineas as LineaPedido[]).filter(l => l.familia_id === familia_id)
            const puedoCotizar = misFamiliaIds.has(familia_id)
            return (
              <div key={familia_id}>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-outline-variant/20">
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                    {familia?.nombre}
                  </h3>
                  {!puedoCotizar && (
                    <span className="badge bg-surface-container text-on-surface-variant text-xs">
                      No comercializás esta familia
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-baseline justify-between gap-4 text-sm ${!puedoCotizar ? 'opacity-50' : ''}`}>
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-outline flex-shrink-0">•</span>
                        <span className="font-medium text-on-surface">{item.descripcion}</span>
                        {item.notas && <span className="text-on-surface-variant text-xs">({item.notas})</span>}
                      </div>
                      <span className="text-on-surface-variant whitespace-nowrap flex-shrink-0">
                        {item.cantidad} {item.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Formulario de cotización */}
      <FormularioCotizacion
        lineas={lineas as LineaPedido[]}
        pedidoId={id}
        cotizacionExistente={cotizacionExistente as (Cotizacion & { lineas: LineaCotizacion[] }) | null}
        misFamiliaIds={[...misFamiliaIds]}
      />
    </div>
  )
}
