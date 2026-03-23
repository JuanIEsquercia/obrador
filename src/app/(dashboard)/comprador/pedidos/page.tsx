import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha, colorEstadoPedido, textoEstadoPedido } from '@/lib/utils'
import type { Pedido } from '@/types'

export default async function PaginaMisPedidos() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*')
    .eq('comprador_id', user.id)
    .order('creado_en', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mis pedidos</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {pedidos?.length ?? 0} pedido{(pedidos?.length ?? 0) !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link href="/comprador/pedidos/nuevo" className="btn-primario">
          + Nuevo pedido
        </Link>
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div className="tarjeta text-center py-16">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            Todavía no tenés pedidos
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Creá tu primer pedido y empezá a recibir cotizaciones de proveedores.
          </p>
          <Link href="/comprador/pedidos/nuevo" className="btn-primario">
            Crear primer pedido
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(pedidos as Pedido[]).map(pedido => (
            <Link
              key={pedido.id}
              href={`/comprador/pedidos/${pedido.id}`}
              className="tarjeta block hover:border-outline-variant hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-on-surface truncate">{pedido.titulo}</h3>
                    <span className={`badge ${colorEstadoPedido(pedido.estado)}`}>
                      {textoEstadoPedido(pedido.estado)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                    <span>📍 {pedido.direccion_entrega}</span>
                    <span>📅 Entrega: {formatearFecha(pedido.fecha_entrega)}</span>
                  </div>
                </div>
                <span className="text-on-surface-variant flex-shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
