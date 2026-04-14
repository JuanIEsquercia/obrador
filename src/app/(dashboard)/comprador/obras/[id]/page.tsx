import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { crearClienteServidor, obtenerUsuario } from '@/lib/supabase/servidor'
import { formatearFecha, formatearPrecio, colorEstadoPedido, textoEstadoPedido } from '@/lib/utils'
import type { Pedido, ConsolidadoFamilia, ConsolidadoLicitacion } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await crearClienteServidor()
  const { data } = await supabase.from('obras').select('nombre').eq('id', id).single()
  return { title: data?.nombre ?? 'Detalle de Obra' }
}

const BADGE_OBRA = {
  activa:    { label: 'Activa',    clase: 'bg-primary-fixed text-primary' },
  terminada: { label: 'Terminada', clase: 'bg-surface-container-high text-on-surface-variant' },
}

export default async function PaginaDetalleObra({ params }: Props) {
  const { id } = await params
  const user = await obtenerUsuario()
  if (!user) redirect('/login')

  const supabase = await crearClienteServidor()

  // Obra + licitaciones en paralelo
  const [{ data: obra }, { data: licitacionesData }] = await Promise.all([
    supabase
      .from('obras')
      .select('*')
      .eq('id', id)
      .eq('comprador_id', user.id)
      .single(),
    supabase
      .from('pedidos')
      .select('id, titulo, estado, fecha_entrega, publicado_en, creado_en')
      .eq('obra_id', id)
      .order('creado_en', { ascending: false }),
  ])

  if (!obra) notFound()

  const licitaciones = (licitacionesData ?? []) as Pedido[]

  // Consolidado: solo de licitaciones cerradas con cotización ganadora
  const licitacionesCerradas = licitaciones.filter(l => l.estado === 'cerrado')

  let porFamilia: ConsolidadoFamilia[] = []
  let porLicitacion: ConsolidadoLicitacion[] = []
  let montoTotal = 0

  if (licitacionesCerradas.length > 0) {
    const { data: ganadoras } = await supabase
      .from('cotizaciones')
      .select(`
        id,
        pedido_id,
        lineas:lineas_cotizacion(
          precio_unitario,
          cantidad_oferta,
          linea:lineas_pedido(
            familia_id,
            familia:familias_producto(id, nombre)
          )
        )
      `)
      .in('pedido_id', licitacionesCerradas.map(l => l.id))
      .eq('ganadora', true)

    // Calcular consolidado
    const familiasMap = new Map<number, { nombre: string; monto: number }>()
    const litMap = new Map<string, number>()

    for (const cot of (ganadoras ?? [])) {
      let montoCot = 0
      for (const linea of (cot.lineas ?? [])) {
        const precio   = (linea as any).precio_unitario ?? 0
        const cantidad = (linea as any).cantidad_oferta ?? 0
        const sub      = precio * cantidad
        montoCot += sub

        const l = (linea as any).linea
        if (l) {
          const familiaId = l.familia_id as number
          const famNombre = l.familia?.nombre ?? '—'
          const prev = familiasMap.get(familiaId) ?? { nombre: famNombre, monto: 0 }
          familiasMap.set(familiaId, { nombre: famNombre, monto: prev.monto + sub })
        }
      }
      litMap.set(cot.pedido_id, (litMap.get(cot.pedido_id) ?? 0) + montoCot)
      montoTotal += montoCot
    }

    porFamilia = Array.from(familiasMap.entries()).map(([familia_id, v]) => ({
      familia_id,
      familia_nombre: v.nombre,
      monto_total: v.monto,
    })).sort((a, b) => b.monto_total - a.monto_total)

    porLicitacion = licitacionesCerradas.map(l => ({
      pedido_id: l.id,
      titulo: l.titulo,
      monto: litMap.get(l.id) ?? 0,
    }))
  }

  const hayConsolidado = licitacionesCerradas.length > 0
  const badge = BADGE_OBRA[obra.estado as keyof typeof BADGE_OBRA]

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <Link href="/comprador/obras" className="text-sm text-on-surface-variant hover:text-on-surface">
          ← Mis Obras
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-on-surface">{obra.nombre}</h1>
              <span className={`badge ${badge.clase}`}>{badge.label}</span>
            </div>
            {obra.descripcion && (
              <p className="text-sm text-on-surface-variant mt-1">{obra.descripcion}</p>
            )}
          </div>
          <Link
            href={`/comprador/obras/${id}/licitaciones/nueva`}
            className="btn-primario flex-shrink-0"
          >
            + Nueva licitación
          </Link>
        </div>
      </div>

      {/* Consolidado — solo si hay licitaciones cerradas */}
      {hayConsolidado && (
        <div className="tarjeta mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Consolidado de la obra</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Resumen de gasto en licitaciones cerradas
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Gasto total</p>
              <p className="text-2xl font-black text-primary">{formatearPrecio(montoTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Por familia */}
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                Por familia de materiales
              </h3>
              <div className="space-y-2">
                {porFamilia.map(f => (
                  <div key={f.familia_id} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-on-surface">{f.familia_nombre}</span>
                    <span className="text-sm font-bold text-on-surface tabular-nums">
                      {formatearPrecio(f.monto_total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por licitación */}
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                Por licitación
              </h3>
              <div className="space-y-2">
                {porLicitacion.map(l => (
                  <div key={l.pedido_id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/comprador/obras/${id}/licitaciones/${l.pedido_id}`}
                      className="text-sm text-primary hover:underline truncate min-w-0"
                    >
                      {l.titulo}
                    </Link>
                    <span className="text-sm font-bold text-on-surface tabular-nums flex-shrink-0">
                      {formatearPrecio(l.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de licitaciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">Licitaciones</h2>
          <span className="text-sm text-on-surface-variant">
            {licitaciones.length} en total
          </span>
        </div>

        {licitaciones.length === 0 ? (
          <div className="tarjeta text-center py-12">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-medium text-on-surface">Esta obra no tiene licitaciones todavía</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Creá la primera para empezar a recibir cotizaciones de proveedores.
            </p>
            <Link href={`/comprador/obras/${id}/licitaciones/nueva`} className="btn-primario inline-flex">
              + Nueva licitación
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {licitaciones.map(lit => (
              <Link
                key={lit.id}
                href={`/comprador/obras/${id}/licitaciones/${lit.id}`}
                className="tarjeta block hover:border-outline-variant hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface truncate">{lit.titulo}</h3>
                      <span className={`badge ${colorEstadoPedido(lit.estado)}`}>
                        {textoEstadoPedido(lit.estado)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      Entrega: {formatearFecha(lit.fecha_entrega)}
                      {lit.publicado_en && (
                        <span className="ml-4">Publicada: {formatearFecha(lit.publicado_en)}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-on-surface-variant flex-shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
