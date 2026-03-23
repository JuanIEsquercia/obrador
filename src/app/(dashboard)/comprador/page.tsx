import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha } from '@/lib/utils'
import type { Pedido, EstadoPedido } from '@/types'

// ── Helpers de badge ────────────────────────────────────────
const BADGE_ESTADO: Record<EstadoPedido, { label: string; clase: string }> = {
  publicado: { label: 'Publicado', clase: 'bg-primary-fixed text-primary' },
  borrador:  { label: 'Borrador',  clase: 'bg-secondary-fixed text-on-secondary-fixed-variant' },
  cerrado:   { label: 'Cerrado',   clase: 'bg-surface-container-high text-on-surface-variant' },
}

export default async function PanelComprador() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Datos en paralelo ─────────────────────────────────────
  const [{ data: perfil }, { data: pedidos }] = await Promise.all([
    supabase
      .from('perfiles')
      .select('nombre, empresa')
      .eq('id', user.id)
      .single(),
    supabase
      .from('pedidos')
      .select('id, titulo, estado, creado_en, fecha_entrega, direccion_entrega')
      .eq('comprador_id', user.id)
      .order('creado_en', { ascending: false }),
  ])

  // ── Stats calculados del lado servidor ────────────────────
  const todosPedidos     = (pedidos ?? []) as Pedido[]
  const pedidosPublicados = todosPedidos.filter(p => p.estado === 'publicado')
  const pedidosRecientes  = todosPedidos.slice(0, 5)

  // Cotizaciones pendientes en pedidos publicados
  let cotizacionesPendientes = 0
  let pedidoParaRevisar: string | null = null

  if (pedidosPublicados.length > 0) {
    const { count } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .in('pedido_id', pedidosPublicados.map(p => p.id))
      .is('ganadora', null)

    cotizacionesPendientes = count ?? 0
    pedidoParaRevisar = pedidosPublicados[0]?.titulo ?? null
  }

  const primerNombre = perfil?.nombre.split(' ')[0] ?? 'Usuario'

  return (
    <div className="space-y-10">

      {/* ── Bienvenida ───────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            ¡Hola, {primerNombre}!
          </h2>
          <p className="text-lg text-on-surface-variant font-medium">
            Bienvenido al panel de Obrador. Así marchan tus obras hoy.
          </p>
        </div>
        <Link
          href="/comprador/pedidos/nuevo"
          className="btn-primario h-12 px-8 text-base"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nueva Licitación
        </Link>
      </section>

      {/* ── Bento Stats ──────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card grande: licitaciones activas */}
        <div className="md:col-span-2 bg-primary rounded-3xl p-8 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10">
            <span className="bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              Resumen Activo
            </span>
            <h3 className="text-6xl font-black mt-5 tabular-nums">
              {pedidosPublicados.length.toString().padStart(2, '0')}
            </h3>
            <p className="text-xl font-medium text-white/80">
              {pedidosPublicados.length === 1 ? 'Licitación publicada' : 'Licitaciones publicadas'} ahora mismo
            </p>
          </div>
          {/* Decoración */}
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-8 bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 120 }}>gavel</span>
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
              <>
                <h3 className="text-2xl font-extrabold leading-tight">
                  {cotizacionesPendientes === 1
                    ? 'Tenés 1 oferta por revisar'
                    : `Tenés ${cotizacionesPendientes} ofertas por revisar`}
                </h3>
                {pedidoParaRevisar && (
                  <p className="mt-2 text-sm font-medium opacity-80 truncate">
                    "{pedidoParaRevisar}"
                  </p>
                )}
              </>
            ) : (
              <h3 className="text-2xl font-extrabold leading-tight">
                Sin ofertas pendientes
              </h3>
            )}
          </div>
          <Link
            href="/comprador/pedidos"
            className="mt-6 flex items-center justify-between bg-on-secondary-container text-secondary-fixed p-4 rounded-2xl font-bold group"
          >
            <span>Ver mis pedidos</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* ── Pedidos Recientes ─────────────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-primary tracking-tight">Pedidos Recientes</h3>
            <p className="text-sm text-on-surface-variant font-medium">Historial de tus últimas gestiones</p>
          </div>
          <Link href="/comprador/pedidos" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            Ver todo
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </Link>
        </div>

        {pedidosRecientes.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">inbox</span>
            <p className="text-on-surface-variant font-medium">Todavía no tenés pedidos.</p>
            <Link href="/comprador/pedidos/nuevo" className="btn-primario mt-4 inline-flex">
              Crear tu primer pedido
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-4 pb-1">Título / Obra</th>
                  <th className="px-4 pb-1 hidden md:table-cell">Dirección</th>
                  <th className="px-4 pb-1 text-center">Estado</th>
                  <th className="px-4 pb-1 hidden sm:table-cell">Entrega</th>
                  <th className="px-4 pb-1 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pedidosRecientes.map(pedido => {
                  const badge = BADGE_ESTADO[pedido.estado as EstadoPedido]
                  return (
                    <tr key={pedido.id} className="group">
                      <td className="bg-surface-container-low group-hover:bg-surface-container transition-colors px-5 py-4 rounded-l-2xl border-y border-l border-outline-variant/10">
                        <p className="font-bold text-primary truncate max-w-[180px]">{pedido.titulo}</p>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          #{pedido.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="bg-surface-container-low group-hover:bg-surface-container transition-colors px-4 py-4 border-y border-outline-variant/10 hidden md:table-cell">
                        <span className="text-on-surface-variant truncate max-w-[160px] block">{pedido.direccion_entrega}</span>
                      </td>
                      <td className="bg-surface-container-low group-hover:bg-surface-container transition-colors px-4 py-4 border-y border-outline-variant/10 text-center">
                        <span className={`${badge.clase} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="bg-surface-container-low group-hover:bg-surface-container transition-colors px-4 py-4 border-y border-outline-variant/10 hidden sm:table-cell">
                        <span className="text-on-surface-variant font-medium">
                          {formatearFecha(pedido.fecha_entrega)}
                        </span>
                      </td>
                      <td className="bg-surface-container-low group-hover:bg-surface-container transition-colors px-5 py-4 rounded-r-2xl border-y border-r border-outline-variant/10 text-right">
                        <Link
                          href={`/comprador/pedidos/${pedido.id}`}
                          className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1"
                        >
                          Ver
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Tips ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        <div className="flex gap-5 p-6 bg-primary-fixed/30 rounded-3xl items-start">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-primary mb-1">Publicá tus licitaciones</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Los pedidos en borrador no son visibles para los proveedores. Publicalos para empezar a recibir cotizaciones.
            </p>
          </div>
        </div>
        <div className="flex gap-5 p-6 bg-secondary-fixed/30 rounded-3xl items-start">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-secondary shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-on-secondary-container mb-1">Soporte Obrador</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              ¿Necesitás ayuda con una licitación? Nuestro equipo está disponible para asistirte en el proceso.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
