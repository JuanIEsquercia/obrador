// Cliente de Supabase para Server Components y Server Actions
import { cache } from 'react'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// cache() deduplica llamadas dentro del mismo render tree (un request = una sola instancia)
export const crearClienteServidor = cache(async () => {
  const almacenCookies = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              almacenCookies.set(name, value, options)
            )
          } catch {
            // Server Component — no puede setear cookies, ignorar
          }
        },
      },
    }
  )
})

// Obtiene el usuario autenticado — se ejecuta una sola vez por request aunque
// lo llamen layout + múltiples page components en paralelo.
export const obtenerUsuario = cache(async () => {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Obtiene el perfil del usuario — una sola query de DB aunque lo llamen layout + page.
export const obtenerPerfil = cache(async () => {
  const user = await obtenerUsuario()
  if (!user) return null
  const supabase = await crearClienteServidor()
  const { data } = await supabase
    .from('perfiles')
    .select('nombre, empresa')
    .eq('id', user.id)
    .single()
  return data
})
