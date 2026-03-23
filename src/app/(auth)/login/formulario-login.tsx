'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/cliente'

export default function FormularioLogin() {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datos, setDatos] = useState({ email: '', password: '' })

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { error: errAuth } = await supabase.auth.signInWithPassword({
      email: datos.email,
      password: datos.password,
    })

    if (errAuth) {
      setError('Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.')
      setCargando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="tu@empresa.com"
          value={datos.email}
          onChange={e => setDatos(d => ({ ...d, email: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
          value={datos.password}
          onChange={e => setDatos(d => ({ ...d, password: e.target.value }))}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="btn-primario w-full h-12"
      >
        {cargando ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
