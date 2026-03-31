'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/cliente'

export default function FormularioNuevaObra() {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre de la obra es requerido.')
      return
    }

    setCargando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada.'); setCargando(false); return }

    const { data: obra, error: err } = await supabase
      .from('obras')
      .insert({
        comprador_id: user.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        estado: 'activa',
      })
      .select('id')
      .single()

    if (err || !obra) {
      setError('No se pudo crear la obra. Intentá de nuevo.')
      setCargando(false)
      return
    }

    router.push(`/comprador/obras/${obra.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={guardar} className="space-y-5">
      <div className="tarjeta space-y-4">
        <div>
          <label className="label">Nombre de la obra</label>
          <input
            type="text"
            className="input"
            placeholder="Recomendado: usá la dirección. ej: Av. Corrientes 1234, piso 3 — CABA"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Usar la dirección como nombre facilita identificar la obra y orienta a los proveedores.
          </p>
        </div>

        <div>
          <label className="label">
            Descripción <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="ej: Ampliación planta alta, construcción en seco. Propietario: Juan García."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Link href="/comprador/obras" className="btn-secundario">
          Cancelar
        </Link>
        <button type="submit" disabled={cargando} className="btn-primario">
          {cargando ? 'Creando...' : 'Crear obra →'}
        </button>
      </div>
    </form>
  )
}
