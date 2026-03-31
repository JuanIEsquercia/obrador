import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import FormularioNuevoPedido from '@/app/(dashboard)/comprador/pedidos/nuevo/formulario-nuevo-pedido'
import type { FamiliaProducto } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaNuevaLicitacion({ params }: Props) {
  const { id: obraId } = await params
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que la obra pertenece al comprador y obtener su nombre
  const [{ data: obra }, { data: catalogo }] = await Promise.all([
    supabase
      .from('obras')
      .select('id, nombre')
      .eq('id', obraId)
      .eq('comprador_id', user.id)
      .single(),
    supabase
      .from('familias_producto')
      .select('id, nombre')
      .order('nombre'),
  ])

  if (!obra) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/comprador/obras/${obraId}`}
          className="text-sm text-on-surface-variant hover:text-on-surface"
        >
          ← {obra.nombre}
        </Link>
        <h1 className="text-2xl font-bold text-on-surface mt-2">Nueva licitación</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Completá los datos del pedido para esta obra. Podés agregar ítems de distintas familias.
        </p>
      </div>

      <FormularioNuevoPedido
        familias={catalogo as FamiliaProducto[]}
        obraId={obraId}
        datosIniciales={{
          titulo: '',
          descripcion: '',
          direccion_entrega: obra.nombre,  // pre-llenado con el nombre de la obra
          fecha_entrega: '',
          fecha_cierre_cotizaciones: '',   // formulario auto-propone hoy+7
        }}
      />
    </div>
  )
}
