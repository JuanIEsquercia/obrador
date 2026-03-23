import { type NextRequest } from 'next/server'
import { actualizarSesion } from '@/lib/supabase/middleware'

export async function middleware(solicitud: NextRequest) {
  return await actualizarSesion(solicitud)
}

export const config = {
  matcher: [
    // Proteger todas las rutas excepto archivos estáticos y rutas públicas
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
