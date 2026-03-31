import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import FormularioNuevaObra from './formulario-nueva-obra'

export default async function PaginaNuevaObra() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Nueva Obra</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Creá un proyecto para organizar tus licitaciones y hacer seguimiento del gasto.
        </p>
      </div>
      <FormularioNuevaObra />
    </div>
  )
}
