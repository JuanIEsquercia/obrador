import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/servidor'
import { formatearFecha, colorEstadoPedido, textoEstadoPedido } from '@/lib/utils'
import AccionesPedido from './acciones-pedido'
import VistaCotizaciones from '@/components/cotizaciones/vista-cotizaciones'
import type { LineaPedido, CotizacionConLineas, FamiliaProducto } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaDetallePedido({ params }: Props) {
  const { id } = await params
  const supabase = await crearClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer pedido
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .eq('comprador_id', user.id)
    .single()

  if (!pedido) notFound()

  // Traer líneas con familia
  const { data: lineas } = await supabase
    .from('lineas_pedido')
    .select('*, familia:familias_producto(id, nombre)')
    .eq('pedido_id', id)
    .order('orden')

  // Traer cotizaciones con vendedor y líneas (solo si publicado o cerrado)
  let cotizaciones: CotizacionConLineas[] = []
  if (pedido.estado !== 'borrador') {
    const { data: cotsData } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        vendedor:perfiles(id, nombre, empresa, telefono),
        lineas:lineas_cotizacion(*)
      `)
      .eq('pedido_id', id)
      .order('creado_en')

    cotizaciones = (cotsData as CotizacionConLineas[]) ?? []
  }

  // Agrupar líneas por familia
  const familiasMap = new Map<number, { familia: FamiliaProducto; lineas: LineaPedido[] }>()
  ;(lineas as LineaPedido[]).forEach(linea => {
    if (!familiasMap.has(linea.familia_id)) {
      familiasMap.set(linea.familia_id, { familia: linea.familia as FamiliaProducto, lineas: [] })
    }
    familiasMap.get(linea.familia_id)!.lineas.push(linea)
  })

  const totalItems = (lineas as LineaPedido[]).length

  // ── Vista borrador: resumen antes de publicar ──────────────────────────────
  if (pedido.estado === 'borrador') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/comprador/pedidos" className="text-sm text-on-surface-variant hover:text-on-surface">
            ← Mis pedidos
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface">{pedido.titulo}</h1>
            <span className={`badge ${colorEstadoPedido(pedido.estado)}`}>
              {textoEstadoPedido(pedido.estado)}
            </span>
          </div>
          {pedido.descripcion && (
            <p className="mt-2 text-sm text-on-surface-variant">{pedido.descripcion}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-4">

            {/* Bento: ubicación + fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="tarjeta flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 text-lg">
                  📍
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-on-surface-variant mb-0.5">Lugar de entrega</p>
                  <p className="font-semibold text-on-surface text-sm leading-snug">{pedido.direccion_entrega}</p>
                </div>
              </div>

              <div className="tarjeta flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center flex-shrink-0 text-lg">
                  📅
                </div>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant mb-0.5">Fecha de entrega</p>
                  <p className="font-semibold text-on-surface text-sm">{formatearFecha(pedido.fecha_entrega)}</p>
                </div>
              </div>
            </div>

            {/* Materiales */}
            <div className="tarjeta">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-on-surface">Materiales solicitados</h2>
                <span className="text-xs text-on-surface-variant">{totalItems} ítem{totalItems !== 1 ? 's' : ''}</span>
              </div>

              {familiasMap.size === 0 ? (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant text-sm">Este pedido no tiene ítems.</p>
                  <Link href={`/comprador/pedidos/${pedido.id}/editar`} className="btn-secundario mt-3 inline-block text-sm">
                    Agregar ítems
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {Array.from(familiasMap.entries()).map(([familia_id, { familia, lineas: ls }]) => (
                    <div key={familia_id}>
                      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-outline-variant/20">
                        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                          {familia?.nombre}
                        </h3>
                        <span className="text-xs text-on-surface-variant opacity-60">
                          {ls.length} ítem{ls.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {ls.map(item => (
                          <div key={item.id} className="flex items-baseline justify-between gap-4 text-sm">
                            <div className="flex items-baseline gap-2 min-w-0">
                              <span className="text-outline flex-shrink-0">•</span>
                              <span className="font-medium text-on-surface">{item.descripcion}</span>
                              {item.notas && (
                                <span className="text-on-surface-variant text-xs truncate">({item.notas})</span>
                              )}
                            </div>
                            <span className="text-on-surface-variant whitespace-nowrap flex-shrink-0">
                              {item.cantidad} {item.unidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <AccionesPedido pedido={pedido} />
          </div>
        </div>
      </div>
    )
  }

  // ── Vista publicado / cerrado ──────────────────────────────────────────────
  const familiasArray = Array.from(
    new Map(
      (lineas as LineaPedido[]).map(l => [l.familia_id, l.familia as FamiliaProducto])
    ).entries()
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/comprador/pedidos" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Mis pedidos
        </Link>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-on-surface">{pedido.titulo}</h1>
              <span className={`badge ${colorEstadoPedido(pedido.estado)}`}>
                {textoEstadoPedido(pedido.estado)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant mt-1">
              <span>📍 {pedido.direccion_entrega}</span>
              <span>📅 Entrega: {formatearFecha(pedido.fecha_entrega)}</span>
              {pedido.publicado_en && (
                <span>📢 Publicado: {formatearFecha(pedido.publicado_en)}</span>
              )}
            </div>
          </div>
        </div>

        {pedido.descripcion && (
          <p className="mt-3 text-sm text-on-surface-variant bg-surface-container rounded-lg p-3">
            {pedido.descripcion}
          </p>
        )}
      </div>

      {/* Ítems del pedido */}
      <div className="tarjeta mb-6">
        <h2 className="font-semibold text-on-surface mb-4">Ítems del pedido</h2>

        {familiasArray.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Este pedido no tiene ítems.</p>
        ) : (
          <div className="space-y-5">
            {familiasArray.map(([familia_id, familia]) => {
              const itemsFamilia = (lineas as LineaPedido[]).filter(l => l.familia_id === familia_id)
              return (
                <div key={familia_id}>
                  <h3 className="text-sm font-medium text-on-surface-variant mb-2 pb-1 border-b border-outline-variant/20">
                    {familia?.nombre}
                  </h3>
                  <div className="space-y-1">
                    {itemsFamilia.map(item => (
                      <div key={item.id} className="flex items-baseline gap-2 text-sm">
                        <span className="text-outline">•</span>
                        <span className="font-medium text-on-surface">{item.descripcion}</span>
                        <span className="text-on-surface-variant">
                          — {item.cantidad} {item.unidad}
                        </span>
                        {item.notas && (
                          <span className="text-on-surface-variant text-xs">({item.notas})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cotizaciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">
            Cotizaciones recibidas
          </h2>
          <span className="text-sm text-on-surface-variant">
            {cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {cotizaciones.length === 0 ? (
          <div className="tarjeta text-center py-12">
            <p className="text-3xl mb-3">⏳</p>
            <p className="font-medium text-on-surface">Esperando cotizaciones</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Los proveedores fueron notificados. Las cotizaciones van a aparecer acá.
            </p>
          </div>
        ) : (
          <VistaCotizaciones
            lineas={lineas as LineaPedido[]}
            cotizaciones={cotizaciones}
            pedidoId={id}
            pedidoCerrado={pedido.estado === 'cerrado'}
          />
        )}
      </div>
    </div>
  )
}
