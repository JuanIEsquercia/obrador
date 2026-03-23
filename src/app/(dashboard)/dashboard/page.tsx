import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'

// Centraliza la lógica post-login: rol + onboarding para vendedores
export default async function PaginaDashboard() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = user.user_metadata?.rol ?? 'comprador'

  if (rol === 'vendedor') {
    const { data: familias } = await supabase
      .from('vendedor_familias')
      .select('familia_id')
      .eq('vendedor_id', user.id)
      .limit(1)

    if (!familias || familias.length === 0) redirect('/onboarding')
    redirect('/vendedor/pedidos')
  }

  redirect('/comprador')
}
