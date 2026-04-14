import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor, obtenerUsuario } from '@/lib/supabase/servidor'
import { formatearFecha, formatearPrecio } from '@/lib/utils'

export const metadata = { title: 'Mis Cotizaciones' }

export default async function PaginaMisCotizaciones() {
  const user = await obtenerUsuario()
  if (!user) redirect('/login')

  const supabase = await crearClienteServidor()

  const { data: cotizaciones, error: errorCotizaciones } = await supabase
    .from('cotizaciones')
    .select(`
      id, pedido_id, ganadora, tiene_financiacion, descuento_pago_contado,
      entrega_inmediata, notas_pago, creado_en,
      lineas:lineas_cotizacion(precio_unitario, cantidad_oferta)
    `)
    .eq('vendedor_id', user.id)
    .order('creado_en', { ascending: false })

  // Buscar los pedidos por separado para evitar problemas de RLS en el join
  const pedidoIds = [...new Set((cotizaciones ?? []).map(c => c.pedido_id))]
  const { data: pedidosData } = pedidoIds.length > 0
    ? await supabase
        .from('pedidos')
        .select('id, titulo, fecha_entrega, estado')
        .in('id', pedidoIds)
    : { data: [] }

  const pedidosMap = new Map((pedidosData ?? []).map(p => [p.id, p]))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Mis cotizaciones</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Historial de todas tus cotizaciones enviadas.
        </p>
      </div>

      {errorCotizaciones && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error mb-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          Error al cargar cotizaciones: {errorCotizaciones.message}
        </div>
      )}

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
            const pedido = pedidosMap.get(cot.pedido_id) ?? null
            if (!pedido) return null
            const lineas = cot.lineas as { precio_unitario: number | null; cantidad_oferta: number | null }[]
            const total = lineas.reduce((sum, l) => {
              if (l.precio_unitario && l.cantidad_oferta) return sum + l.precio_unitario * l.cantidad_oferta
              return sum
            }, 0)

            const esGanadora = cot.ganadora === true
            const esNoSeleccionada = cot.ganadora === false
            const enEvaluacion = cot.ganadora === null

            let estadoBadge = ''
            let estadoColor = ''
            if (enEvaluacion) {
              estadoBadge = 'En evaluación'
              estadoColor = 'bg-secondary-fixed text-on-secondary-fixed-variant'
            } else if (esGanadora) {
              estadoBadge = '🏆 Seleccionada'
              estadoColor = 'bg-primary-fixed text-primary'
            } else {
              estadoBadge = 'No seleccionada'
              estadoColor = 'bg-surface-container-high text-on-surface-variant'
            }

            return (
              <Link
                key={cot.id}
                href={`/vendedor/pedidos/${cot.pedido_id}`}
                className={`block rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                  esGanadora
                    ? 'border-primary bg-primary-fixed/20 hover:border-primary'
                    : esNoSeleccionada
                    ? 'border-outline-variant/30 bg-surface-container opacity-70 hover:opacity-100'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                {esGanadora && (
                  <div className="flex items-center gap-2 mb-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <span className="material-symbols-outlined icon-fill text-primary text-xl">emoji_events</span>
                    <div>
                      <p className="text-sm font-bold text-primary">¡Ganaste esta licitación!</p>
                      <p className="text-xs text-primary/70">Coordiná la entrega con el comprador.</p>
                    </div>
                  </div>
                )}
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
                    <p className="text-xs text-on-surface-variant">Total cotizado</p>
                    <p className={`text-lg font-bold ${esGanadora ? 'text-primary' : 'text-on-surface'}`}>
                      {formatearPrecio(total)}
                    </p>
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
