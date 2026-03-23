import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RUTAS_PUBLICAS = ['/', '/login', '/registro']

export async function actualizarSesion(solicitud: NextRequest) {
  let respuesta = NextResponse.next({ request: solicitud })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return solicitud.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => solicitud.cookies.set(name, value))
          respuesta = NextResponse.next({ request: solicitud })
          cookiesToSet.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = solicitud.nextUrl
  const url = solicitud.nextUrl.clone()

  const esRutaAuth = pathname.startsWith('/login') || pathname.startsWith('/registro')
  const esPublica = RUTAS_PUBLICAS.includes(pathname)

  // Sin sesión → solo puede estar en rutas públicas
  if (!user && !esPublica) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const rol = (user.user_metadata?.rol ?? 'comprador') as string

    // Ya logueado intentando entrar a login/registro → su dashboard
    if (esRutaAuth) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Vendedor intentando acceder a rutas de comprador
    if (rol === 'vendedor' && pathname.startsWith('/comprador')) {
      url.pathname = '/vendedor/pedidos'
      return NextResponse.redirect(url)
    }

    // Comprador intentando acceder a rutas de vendedor
    if (rol === 'comprador' && pathname.startsWith('/vendedor')) {
      url.pathname = '/comprador'
      return NextResponse.redirect(url)
    }
  }

  return respuesta
}
