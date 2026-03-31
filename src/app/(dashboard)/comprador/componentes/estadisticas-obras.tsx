import Link from 'next/link'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import type { Obra } from '@/types'

export async function EstadisticasObras({ userId }: { userId: string }) {
  const supabase = await crearClienteServidor()

  const [{ data: obras }, { data: pedidosStats }] = await Promise.all([
    supabase
      .from('obras')
      .select('estado')
      .eq('comprador_id', userId),
    supabase
      .from('pedidos')
      .select('id, estado')
      .eq('comprador_id', userId),
  ])

  const todasObras = (obras ?? []) as Pick<Obra, 'estado'>[]
  const obrasActivas = todasObras.filter(o => o.estado === 'activa')

  const pedidos = pedidosStats ?? []
  const litPublicadas = pedidos.filter(p => p.estado === 'publicado').length

  let cotizacionesPendientes = 0
  if (litPublicadas > 0) {
    const litPublicadasIds = pedidos.filter(p => p.estado === 'publicado').map(p => p.id)
    const { count } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .in('pedido_id', litPublicadasIds)
      .is('ganadora', null)
    cotizacionesPendientes = count ?? 0
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card grande: obras activas */}
      <div className="md:col-span-2 bg-primary rounded-3xl p-8 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div className="relative z-10">
          <span className="bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            Resumen Activo
          </span>
          <h3 className="text-6xl font-black mt-5 tabular-nums">
            {obrasActivas.length.toString().padStart(2, '0')}
          </h3>
          <p className="text-xl font-medium text-white/80">
            {obrasActivas.length === 1 ? 'Obra activa' : 'Obras activas'} ahora mismo
          </p>
          {litPublicadas > 0 && (
            <p className="text-sm text-white/60 mt-1">
              {litPublicadas} licitación{litPublicadas !== 1 ? 'es' : ''} publicada{litPublicadas !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined icon-fill" style={{ fontSize: 120 }}>domain</span>
        </div>
      </div>

      {/* Card: ofertas pendientes */}
      <div className="bg-secondary-container rounded-3xl p-8 text-on-secondary-container flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined">pending_actions</span>
            <span className="text-xs font-black uppercase tracking-widest">Pendientes</span>
          </div>
          {cotizacionesPendientes > 0 ? (
            <h3 className="text-2xl font-extrabold leading-tight">
              {cotizacionesPendientes === 1
                ? 'Tenés 1 oferta por revisar'
                : `Tenés ${cotizacionesPendientes} ofertas por revisar`}
            </h3>
          ) : (
            <h3 className="text-2xl font-extrabold leading-tight">
              Sin ofertas pendientes
            </h3>
          )}
        </div>
        <Link
          href="/comprador/obras"
          className="mt-6 flex items-center justify-between bg-on-secondary-container text-secondary-fixed p-4 rounded-2xl font-bold group"
        >
          <span>Ver mis obras</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  )
}

export function SkeletonEstadisticasObras() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div className="md:col-span-2 bg-surface-container-high rounded-3xl min-h-[220px]" />
      <div className="bg-surface-container-high rounded-3xl min-h-[220px]" />
    </section>
  )
}
