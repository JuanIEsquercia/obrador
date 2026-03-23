import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha, formatearPrecio } from '@/lib/utils'

export default async function PaginaMisCotizaciones() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cotizaciones } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      pedido:pedidos(id, titulo, fecha_entrega, direccion_entrega, estado),
      lineas:lineas_cotizacion(precio_unitario, cantidad_oferta)
    `)
    .eq('vendedor_id', user.id)
    .order('creado_en', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Mis cotizaciones</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Historial de todas tus cotizaciones enviadas.
        </p>
      </div>

      {!cotizaciones || cotizaciones.length === 0 ? (
        <div className="tarjeta text-center py-16">
          <p className="text-4xl mb-4">📄</p>
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            Todavía no cotizaste nada
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Buscá pedidos disponibles y empezá a cotizar.
          </p>
          <Link href="/vendedor/pedidos" className="btn-primario">
            Ver pedidos disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cotizaciones.map(cot => {
            const pedido = cot.pedido as { id: string; titulo: string; fecha_entrega: string; estado: string }
            const lineas = cot.lineas as { precio_unitario: number | null; cantidad_oferta: number | null }[]
            const total = lineas.reduce((sum, l) => {
              if (l.precio_unitario && l.cantidad_oferta) return sum + l.precio_unitario * l.cantidad_oferta
              return sum
            }, 0)

            let estadoBadge = ''
            let estadoColor = ''
            if (cot.ganadora === null) {
              estadoBadge = 'En evaluación'
              estadoColor = 'bg-secondary-fixed text-on-secondary-fixed-variant'
            } else if (cot.ganadora === true) {
              estadoBadge = '🏆 Seleccionada'
              estadoColor = 'bg-primary-fixed text-primary'
            } else {
              estadoBadge = 'No seleccionada'
              estadoColor = 'bg-surface-container-high text-on-surface-variant'
            }

            return (
              <Link
                key={cot.id}
                href={`/vendedor/pedidos/${pedido.id}`}
                className="tarjeta block hover:border-outline-variant hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface">{pedido.titulo}</h3>
                      <span className={`badge ${estadoColor}`}>{estadoBadge}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                      <span>📅 Entrega: {formatearFecha(pedido.fecha_entrega)}</span>
                      <span>Cotizaste el {formatearFecha(cot.creado_en)}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {cot.tiene_financiacion && (
                        <span className="badge bg-primary-fixed text-primary">Financiación</span>
                      )}
                      {cot.descuento_pago_contado && (
                        <span className="badge bg-secondary-fixed text-on-secondary-fixed-variant">Descuento contado</span>
                      )}
                      {cot.entrega_inmediata && (
                        <span className="badge bg-primary-fixed text-primary">Entrega inmediata</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-on-surface-variant">Total</p>
                    <p className="text-lg font-bold text-on-surface">{formatearPrecio(total)}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
