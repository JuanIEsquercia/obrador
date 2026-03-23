import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import FormularioNuevoPedido from '../../nuevo/formulario-nuevo-pedido'
import type { FamiliaProducto, LineaPedido } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaEditarPedido({ params }: Props) {
  const { id } = await params
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Solo se puede editar si es borrador y pertenece al comprador
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .eq('comprador_id', user.id)
    .eq('estado', 'borrador')
    .single()

  if (!pedido) notFound()

  const [{ data: catalogo }, { data: lineas }] = await Promise.all([
    supabase.from('familias_producto').select('id, nombre').order('nombre'),
    supabase.from('lineas_pedido').select('*').eq('pedido_id', id).order('orden'),
  ])

  const lineasIniciales = (lineas ?? []).map(l => ({
    familia_id: l.familia_id,
    descripcion: l.descripcion,
    cantidad: Number(l.cantidad),
    unidad: l.unidad,
    notas: l.notas ?? '',
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/comprador/pedidos/${id}`} className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Volver al pedido
        </Link>
        <h1 className="text-2xl font-bold text-on-surface mt-2">Editar pedido</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Modificá los datos del pedido antes de publicarlo.
        </p>
      </div>

      <FormularioNuevoPedido
        familias={catalogo as FamiliaProducto[]}
        pedidoId={id}
        datosIniciales={{
          titulo: pedido.titulo,
          descripcion: pedido.descripcion ?? '',
          direccion_entrega: pedido.direccion_entrega,
          fecha_entrega: pedido.fecha_entrega,
        }}
        lineasIniciales={lineasIniciales}
      />
    </div>
  )
}
