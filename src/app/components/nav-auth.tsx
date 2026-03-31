import Link from 'next/link'
import { crearClienteServidor } from '@/lib/supabase/servidor'

export async function NavAuth() {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="h-10 px-5 bg-primary text-on-primary font-bold text-sm rounded-xl active:scale-95 transition-transform flex items-center"
      >
        Ir al panel
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className="h-10 px-4 text-primary font-semibold text-sm rounded-xl hover:bg-primary-fixed/40 transition-colors flex items-center"
      >
        Ingresar
      </Link>
      <Link
        href="/registro"
        className="h-10 px-5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center"
      >
        Registrarse
      </Link>
    </>
  )
}

// Fallback idéntico al estado no autenticado — se muestra mientras carga NavAuth
export function NavAuthFallback() {
  return (
    <>
      <div className="h-10 px-4 w-20 rounded-xl bg-primary-fixed/20 animate-pulse" />
      <div className="h-10 px-5 w-28 rounded-xl bg-primary/20 animate-pulse" />
    </>
  )
}
