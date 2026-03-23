'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import type { RolUsuario } from '@/types'

export default function FormularioRegistro({ rolInicial }: { rolInicial?: RolUsuario }) {
  const router = useRouter()
  // Lazy init para evitar que createBrowserClient se ejecute durante SSR
  const [supabase] = useState(() => crearClienteNavegador())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datos, setDatos] = useState({
    email: '',
    password: '',
    confirmar_password: '',
    nombre: '',
    empresa: '',
    cuit: '',
    telefono: '',
    rol: (rolInicial ?? '') as RolUsuario | '',
  })

  function cambiar(campo: string, valor: string) {
    setDatos(d => ({ ...d, [campo]: valor }))
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!datos.rol) {
      setError('Tenés que elegir si sos comprador o vendedor.')
      return
    }
    if (datos.password !== datos.confirmar_password) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (datos.password.length < 6) {
      setError('La contraseña tiene que tener al menos 6 caracteres.')
      return
    }

    setCargando(true)

    const { error: errAuth } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: {
          nombre: datos.nombre,
          empresa: datos.empresa,
          cuit: datos.cuit,
          telefono: datos.telefono || null,
          rol: datos.rol,
        },
      },
    })

    if (errAuth) {
      setError(
        errAuth.message.includes('already registered')
          ? 'Ese email ya está registrado. ¿Querés iniciar sesión?'
          : 'Hubo un error al crear la cuenta. Intentá de nuevo.'
      )
      setCargando(false)
      return
    }

    if (datos.rol === 'vendedor') {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  const rolesOpciones = [
    {
      valor: 'comprador' as RolUsuario,
      titulo: 'Soy Comprador',
      descripcion: 'Publicás pedidos de materiales y recibís cotizaciones de proveedores.',
      icono: 'construction',
    },
    {
      valor: 'vendedor' as RolUsuario,
      titulo: 'Soy Vendedor',
      descripcion: 'Sos corralón o proveedor. Cotizás pedidos y conseguís nuevos clientes.',
      icono: 'storefront',
    },
  ]

  return (
    <form onSubmit={manejarEnvio} className="space-y-5">

      {/* Selector de rol */}
      <div>
        <p className="label">¿Qué rol tenés en Obrador?</p>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {rolesOpciones.map(opcion => {
            const activo = datos.rol === opcion.valor
            return (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => cambiar('rol', opcion.valor)}
                className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  activo
                    ? 'border-primary bg-primary-fixed shadow-sm'
                    : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`material-symbols-outlined text-xl ${activo ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {opcion.icono}
                  </span>
                  <p className={`font-bold text-sm ${activo ? 'text-primary' : 'text-on-surface'}`}>
                    {opcion.titulo}
                  </p>
                  {activo && (
                    <span className="material-symbols-outlined icon-fill text-primary text-base ml-auto">check_circle</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{opcion.descripcion}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre y apellido</label>
          <input
            id="nombre"
            type="text"
            required
            className="input"
            placeholder="Carlos González"
            value={datos.nombre}
            onChange={e => cambiar('nombre', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="empresa" className="label">Razón social</label>
          <input
            id="empresa"
            type="text"
            required
            className="input"
            placeholder={datos.rol === 'vendedor' ? 'Corralón El Constructor S.R.L.' : 'Construcciones González S.A.'}
            value={datos.empresa}
            onChange={e => cambiar('empresa', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cuit" className="label">CUIT</label>
        <input
          id="cuit"
          type="text"
          required
          className="input"
          placeholder="20-12345678-9"
          value={datos.cuit}
          onChange={e => cambiar('cuit', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="carlos@empresa.com"
            value={datos.email}
            onChange={e => cambiar('email', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="telefono" className="label">
            Teléfono <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <input
            id="telefono"
            type="tel"
            className="input"
            placeholder="3794 000000"
            value={datos.telefono}
            onChange={e => cambiar('telefono', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className="input"
            placeholder="Mínimo 6 caracteres"
            value={datos.password}
            onChange={e => cambiar('password', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmar_password" className="label">Repetir contraseña</label>
          <input
            id="confirmar_password"
            type="password"
            required
            autoComplete="new-password"
            className="input"
            placeholder="••••••••"
            value={datos.confirmar_password}
            onChange={e => cambiar('confirmar_password', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={cargando || !datos.rol}
        className="btn-primario w-full h-12"
      >
        {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
