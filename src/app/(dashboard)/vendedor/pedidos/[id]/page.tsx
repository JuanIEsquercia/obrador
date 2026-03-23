import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha } from '@/lib/utils'
import FormularioCotizacion from './formulario-cotizacion'
import type { LineaPedido, Cotizacion, LineaCotizacion, FamiliaProducto } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaCotizarPedido({ params }: Props) {
  const { id } = await params
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer pedido publicado
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*, comprador:perfiles(nombre, empresa)')
    .eq('id', id)
    .eq('estado', 'publicado')
    .single()

  if (!pedido) notFound()

  // Traer líneas con familia
  const { data: lineas } = await supabase
    .from('lineas_pedido')
    .select('*, familia:familias_producto(id, nombre)')
    .eq('pedido_id', id)
    .order('orden')

  // Cotización existente del vendedor
  const { data: cotizacionExistente } = await supabase
    .from('cotizaciones')
    .select('*, lineas:lineas_cotizacion(*)')
    .eq('pedido_id', id)
    .eq('vendedor_id', user.id)
    .single()

  // Familias que comercializa el vendedor
  const { data: misF } = await supabase
    .from('vendedor_familias')
    .select('familia_id')
    .eq('vendedor_id', user.id)

  const misFamiliaIds = new Set((misF ?? []).map(f => f.familia_id))

  // Agrupar todas las familias del pedido para el resumen
  const familias = Array.from(
    new Map(
      (lineas as LineaPedido[]).map(l => [l.familia_id, l.familia as FamiliaProducto])
    ).entries()
  )

  const comprador = pedido.comprador as { nombre: string; empresa: string }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/vendedor/pedidos" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Pedidos disponibles
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
