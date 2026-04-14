import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor, obtenerUsuario } from '@/lib/supabase/servidor'
import type { Obra } from '@/types'

export const metadata = { title: 'Mis Obras' }

const BADGE_ESTADO = {
  activa:    { label: 'Activa',    clase: 'bg-primary-fixed text-primary' },
  terminada: { label: 'Terminada', clase: 'bg-surface-container-high text-on-surface-variant' },
}

export default async function PaginaMisObras() {
  const user = await obtenerUsuario()
  if (!user) redirect('/login')

  const supabase = await crearClienteServidor()

  // Obras con conteo de licitaciones
  const { data: obras } = await supabase
    .from('obras')
    .select('*, licitaciones:pedidos(id, estado)')
    .eq('comprador_id', user.id)
    .order('creado_en', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mis Obras</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {obras?.length ?? 0} obra{(obras?.length ?? 0) !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link href="/comprador/obras/nueva" className="btn-primario">
          + Nueva Obra
        </Link>
      </div>

      {!obras || obras.length === 0 ? (
        <div className="tarjeta text-center py-16">
          <p className="text-4xl mb-4">🏗️</p>
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            Todavía no tenés obras
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Creá tu primera obra para organizar tus licitaciones y hacer seguimiento del gasto por proyecto.
          </p>
          <Link href="/comprador/obras/nueva" className="btn-primario">
            Crear primera obra
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(obras as (Obra & { licitaciones: { id: string; estado: string }[] })[]).map(obra => {
            const licitaciones = obra.licitaciones ?? []
            const publicadas = licitaciones.filter(l => l.estado === 'publicado').length
            const cerradas   = licitaciones.filter(l => l.estado === 'cerrado').length
            const badge = BADGE_ESTADO[obra.estado]

            return (
              <Link
                key={obra.id}
                href={`/comprador/obras/${obra.id}`}
                className="tarjeta block hover:border-outline-variant hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface truncate">{obra.nombre}</h3>
                      <span className={`badge ${badge.clase}`}>{badge.label}</span>
                    </div>
                    {obra.descripcion && (
                      <p className="text-sm text-on-surface-variant truncate mb-1">{obra.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                      <span>{licitaciones.length} licitación{licitaciones.length !== 1 ? 'es' : ''}</span>
                      {publicadas > 0 && <span className="text-primary font-medium">{publicadas} activa{publicadas !== 1 ? 's' : ''}</span>}
                      {cerradas > 0 && <span>{cerradas} cerrada{cerradas !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <span className="text-on-surface-variant flex-shrink-0">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
