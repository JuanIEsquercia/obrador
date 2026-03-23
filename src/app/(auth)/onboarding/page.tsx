import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import FormularioOnboarding from './formulario-onboarding'
import type { FamiliaProducto } from '@/types'

export default async function PaginaOnboarding() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que es vendedor
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'vendedor') redirect('/dashboard')

  // Verificar si ya completó el onboarding
  const { data: familias } = await supabase
    .from('vendedor_familias')
    .select('familia_id')
    .eq('vendedor_id', user.id)

  if (familias && familias.length > 0) redirect('/dashboard')

  // Traer catálogo de familias
  const { data: catalogo } = await supabase
    .from('familias_producto')
    .select('id, nombre')
    .order('nombre')

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="tarjeta">
        <h2 className="text-xl font-bold text-on-surface mb-2">
          ¿Qué productos vendés?
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Seleccioná las familias de materiales que comercializás.
          Vas a ver los pedidos que coincidan con estas categorías.
        </p>
        <FormularioOnboarding familias={catalogo as FamiliaProducto[]} />
      </div>
    </div>
  )
}
