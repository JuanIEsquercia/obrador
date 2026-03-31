import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha, diasRestantes } from '@/lib/utils'
import type { Pedido, FamiliaProducto } from '@/types'

export default async function PaginaPedidosDisponibles() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Familias del vendedor
  const { data: misF } = await supabase
    .from('vendedor_familias')
    .select('familia_id, familia:familias_producto(id, nombre)')
    .eq('vendedor_id', user.id)

  const misFamilias = (misF ?? []).map(f => f.familia as unknown as FamiliaProducto)

  // Pedidos disponibles que matchean (RLS filtra por familias)
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select(`
      *,
      comprador:perfiles(nombre, empresa),
      lineas:lineas_pedido(familia_id, familia:familias_producto(nombre))
    `)
    .eq('estado', 'publicado')
    .order('publicado_en', { ascending: false })

  // Pedidos ya cotizados por este vendedor
  const { data: cotizados } = await supabase
    .from('cotizaciones')
    .select('pedido_id')
    .eq('vendedor_id', user.id)

  const pedidosCotizados = new Set((cotizados ?? []).map(c => c.pedido_id))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Pedidos disponibles</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Pedidos publicados que coinciden con tus familias de productos.
        </p>
        {misFamilias.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-on-surface-variant">Tus familias:</span>
            {misFamilias.map(f => (
              <span key={f.id} className="badge bg-primary-fixed text-primary">{f.nombre}</span>
            ))}
          </div>
        )}
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div className="tarjeta text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            No hay pedidos disponibles
          </h3>
          <p className="text-sm text-on-surface-variant">
            Cuando un comprador publique un pedido con tus familias de productos, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(pedidos as (Pedido & {
            comprador: { nombre: string; empresa: string }
            lineas: { familia_id: number; familia: { nombre: string } }[]
          })[]).map(pedido => {
            const yaCotice = pedidosCotizados.has(pedido.id)

            const familiasDelPedido = Array.from(
              new Map(pedido.lineas.map(l => [l.familia_id, l.familia])).values()
            ).filter(Boolean)

            const diasCierre = pedido.fecha_cierre_cotizaciones
              ? diasRestantes(pedido.fecha_cierre_cotizaciones)
              : null
            const plazoUrgente = diasCierre !== null && diasCierre <= 2 && diasCierre >= 0

            return (
              <div key={pedido.id} className="tarjeta">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface">{pedido.titulo}</h3>
                      {yaCotice && (
                        <span className="badge bg-primary-fixed text-primary text-xs">✓ Cotizado</span>
                      )}
                      {plazoUrgente && !yaCotice && (
                        <span className="badge bg-tertiary-container text-on-tertiary-container text-xs">
                          ⚡ {diasCierre === 0 ? 'Cierra hoy' : `${diasCierre}d restantes`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">
                      {pedido.comprador.empresa}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant mb-3">
                      <span>📍 {pedido.direccion_entrega}</span>
                      {pedido.fecha_cierre_cotizaciones && (
                        <span>⏰ Cotizá hasta: {formatearFecha(pedido.fecha_cierre_cotizaciones)}</span>
                      )}
                      <span>📅 Entrega: {formatearFecha(pedido.fecha_entrega)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {familiasDelPedido.map(f => (
                        <span key={f?.nombre} className="badge bg-surface-container text-on-surface-variant">
                          {f?.nombre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/vendedor/pedidos/${pedido.id}`}
                    className={`flex-shrink-0 ${yaCotice ? 'btn-secundario' : 'btn-primario'}`}
                  >
                    {yaCotice ? 'Ver / editar' : 'Cotizar →'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
