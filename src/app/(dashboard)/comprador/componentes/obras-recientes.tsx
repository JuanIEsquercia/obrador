import Link from 'next/link'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha } from '@/lib/utils'
import { CONSTANTES_OBRA } from '@/lib/constants'

export async function ObrasRecientes({ userId }: { userId: string }) {
  const supabase = await crearClienteServidor()

  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre, estado, creado_en')
    .eq('comprador_id', userId)
    .order('creado_en', { ascending: false })
    .limit(5)

  const obrasRecientes = obras ?? []

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">Obras Recientes</h3>
          <p className="text-sm text-on-surface-variant font-medium">Tus últimas 5 obras</p>
        </div>
        <Link href="/comprador/obras" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
          Ver todo
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </Link>
      </div>

      {obrasRecientes.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">domain</span>
          <p className="text-on-surface-variant font-medium">Todavía no tenés obras.</p>
          <Link href="/comprador/obras/nueva" className="btn-primario mt-4 inline-flex">
            Crear tu primera obra
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {obrasRecientes.map(obra => {
            const badge = CONSTANTES_OBRA[obra.estado as keyof typeof CONSTANTES_OBRA]
            return (
              <Link
                key={obra.id}
                href={`/comprador/obras/${obra.id}`}
                className="flex items-center justify-between gap-4 p-4 bg-surface-container-low hover:bg-surface-container rounded-2xl transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-bold text-primary truncate">{obra.nombre}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    Creada el {formatearFecha(obra.creado_en)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`${badge.clase} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                    {badge.label}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function SkeletonObrasRecientes() {
  return (
    <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm animate-pulse">
      <div className="h-8 bg-surface-container-high rounded w-48 mb-2" />
      <div className="h-4 bg-surface-container-high rounded w-32 mb-8" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-surface-container-high rounded-2xl w-full" />
        ))}
      </div>
    </section>
  )
}
