'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import type { FamiliaProducto } from '@/types'

export default function FormularioOnboarding({ familias }: { familias: FamiliaProducto[] }) {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleFamilia(id: number) {
    setSeleccionadas(prev => {
      const nueva = new Set(prev)
      if (nueva.has(id)) {
        nueva.delete(id)
      } else {
        nueva.add(id)
      }
      return nueva
    })
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (seleccionadas.size === 0) {
      setError('Tenés que seleccionar al menos una familia de productos.')
      return
    }

    setCargando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesión expirada. Por favor, ingresá de nuevo.')
      setCargando(false)
      return
    }

    const registros = Array.from(seleccionadas).map(familia_id => ({
      vendedor_id: user.id,
      familia_id,
    }))

    const { error: errInsert } = await supabase
      .from('vendedor_familias')
      .insert(registros)

    if (errInsert) {
      setError('No se pudieron guardar las familias. Intentá de nuevo.')
      setCargando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const ICONOS: Record<string, string> = {
    'Ladrillos':  'deployed_code',
    'Hierros':    'grid_on',
    'Cemento':    'layers',
    'Pinturas':   'format_paint',
    'Sanitarios': 'plumbing',
    'Eléctrico':  'electric_bolt',
    'Madera':     'nature',
    'Piedra':     'landscape',
    'Arena':      'water_drop',
    'Otros':      'inventory_2',
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {familias.map(familia => {
          const activa = seleccionadas.has(familia.id)
          return (
            <button
              key={familia.id}
              type="button"
              onClick={() => toggleFamilia(familia.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150 ${
                activa
                  ? 'border-primary bg-primary-fixed/40 shadow-sm'
                  : 'border-outline-variant/40 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl flex-shrink-0 ${activa ? 'text-primary' : 'text-on-surface-variant'}`}>
                {ICONOS[familia.nombre] ?? 'inventory_2'}
              </span>
              <span className={`text-sm font-semibold ${activa ? 'text-primary' : 'text-on-surface'}`}>
                {familia.nombre}
              </span>
              {activa && (
                <span className="material-symbols-outlined icon-fill text-primary text-base ml-auto flex-shrink-0">check_circle</span>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-sm text-on-surface-variant">
        {seleccionadas.size === 0
          ? 'Ninguna familia seleccionada'
          : `${seleccionadas.size} familia${seleccionadas.size > 1 ? 's' : ''} seleccionada${seleccionadas.size > 1 ? 's' : ''}`
        }
      </p>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={cargando || seleccionadas.size === 0}
        className="btn-primario w-full h-12"
      >
        {cargando ? 'Guardando...' : 'Empezar a cotizar'}
        {!cargando && <span className="material-symbols-outlined text-base">arrow_forward</span>}
      </button>
    </form>
  )
}
