import Link from 'next/link'
import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import FormularioNuevoPedido from './formulario-nuevo-pedido'
import type { FamiliaProducto } from '@/types'

export default async function PaginaNuevoPedido() {
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: catalogo } = await supabase
    .from('familias_producto')
    .select('id, nombre')
    .order('nombre')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/comprador/pedidos" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Mis pedidos
        </Link>
        <h1 className="text-2xl font-bold text-on-surface mt-2">Nueva licitación</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Completá los datos del pedido. Podés agregar ítems de distintas familias de productos.
        </p>
      </div>

      <FormularioNuevoPedido familias={catalogo as FamiliaProducto[]} />
    </div>
  )
}
