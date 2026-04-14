import { redirect } from 'next/navigation'
import { obtenerUsuario, obtenerPerfil } from '@/lib/supabase/servidor'
import NavegacionPrincipal from '@/components/ui/navegacion-principal'
import type { RolUsuario } from '@/types'

export default async function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const user = await obtenerUsuario()
  if (!user) redirect('/login')

  // El rol viene del JWT (user_metadata) — es confiable y no requiere query extra.
  // nombre y empresa sí vienen de la DB porque pueden actualizarse post-registro.
  const rol = (user.user_metadata?.rol ?? 'comprador') as RolUsuario

  // obtenerPerfil() está cacheada: si la page del mismo render ya la llamó,
  // no genera una segunda query a la DB.
  const perfil = await obtenerPerfil()

  const nombre = perfil?.nombre ?? user.user_metadata?.nombre ?? ''
  const empresa = perfil?.empresa ?? user.user_metadata?.empresa ?? ''

  return (
    <div className="bg-surface">
      <NavegacionPrincipal nombre={nombre} empresa={empresa} rol={rol} />
      <main className="md:ml-64 px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
