import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import NavegacionPrincipal from '@/components/ui/navegacion-principal'
import type { RolUsuario } from '@/types'

export default async function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // El rol viene del JWT (user_metadata) — es confiable y no requiere query extra.
  // nombre y empresa sí vienen de la DB porque pueden actualizarse post-registro.
  const rol = (user.user_metadata?.rol ?? 'comprador') as RolUsuario

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, empresa')
    .eq('id', user.id)
    .single()

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
