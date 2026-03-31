import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { EstadisticasObras, SkeletonEstadisticasObras } from './componentes/estadisticas-obras'
import { ObrasRecientes, SkeletonObrasRecientes } from './componentes/obras-recientes'

export default async function PanelComprador() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener solo el perfil para el saludo de forma bloqueante rápida
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', user.id)
    .single()

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
          href="/comprador/obras/nueva"
          className="btn-primario h-12 px-8 text-base"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Nueva Obra
        </Link>
      </section>

      {/* ── Bento Stats (Streaming) ──────────────────────────── */}
      <Suspense fallback={<SkeletonEstadisticasObras />}>
        <EstadisticasObras userId={user.id} />
      </Suspense>

      {/* ── Obras Recientes (Streaming) ──────────────────────── */}
      <Suspense fallback={<SkeletonObrasRecientes />}>
        <ObrasRecientes userId={user.id} />
      </Suspense>

      {/* ── Tips ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        <div className="flex gap-5 p-6 bg-primary-fixed/30 rounded-3xl items-start">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-primary mb-1">Nombrá tus obras con la dirección</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Usar la dirección como nombre facilita identificar la obra y orienta a los proveedores cuando ven tus licitaciones.
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
