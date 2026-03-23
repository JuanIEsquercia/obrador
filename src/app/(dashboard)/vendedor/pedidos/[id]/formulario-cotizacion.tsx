'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import { formatearPrecio } from '@/lib/utils'
import type { LineaPedido, FamiliaProducto, Cotizacion, LineaCotizacion } from '@/types'

interface Props {
  lineas: LineaPedido[]
  pedidoId: string
  cotizacionExistente: (Cotizacion & { lineas: LineaCotizacion[] }) | null
  misFamiliaIds: number[]
}

export default function FormularioCotizacion({
  lineas,
  pedidoId,
  cotizacionExistente,
  misFamiliaIds,
}: Props) {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const yaCotizo = cotizacionExistente !== null
  const esCerrada = cotizacionExistente?.ganadora !== null && cotizacionExistente?.ganadora !== undefined

  const [condiciones, setCondiciones] = useState({
    tiene_financiacion: cotizacionExistente?.tiene_financiacion ?? false,
    descuento_pago_contado: cotizacionExistente?.descuento_pago_contado ?? false,
    entrega_inmediata: cotizacionExistente?.entrega_inmediata ?? false,
    acepta_division: cotizacionExistente?.acepta_division ?? true,
    notas_pago: cotizacionExistente?.notas_pago ?? '',
  })

  // { [linea_pedido_id]: { precio_unitario, cantidad_oferta, notas } }
  const [precios, setPrecios] = useState<Record<string, {
    precio_unitario: string
    cantidad_oferta: string
    notas: string
  }>>(() => {
    const inicial: Record<string, { precio_unitario: string; cantidad_oferta: string; notas: string }> = {}
    lineas.forEach(linea => {
      const existente = cotizacionExistente?.lineas.find(lc => lc.linea_pedido_id === linea.id)
      inicial[linea.id] = {
        precio_unitario: existente?.precio_unitario?.toString() ?? '',
        cantidad_oferta: existente?.cantidad_oferta?.toString() ?? linea.cantidad.toString(),
        notas: existente?.notas ?? '',
      }
    })
    return inicial
  })

  function actualizarPrecio(lineaId: string, campo: string, valor: string) {
    setPrecios(p => ({ ...p, [lineaId]: { ...p[lineaId], [campo]: valor } }))
  }

  // Solo las líneas de familias que el vendedor comercializa
  const lineasCotizables = lineas.filter(l => misFamiliaIds.includes(l.familia_id))

  // Agrupar líneas cotizables por familia
  const familiasMap = new Map<number, { familia: FamiliaProducto; lineas: LineaPedido[] }>()
  lineasCotizables.forEach(linea => {
    if (!familiasMap.has(linea.familia_id)) {
      familiasMap.set(linea.familia_id, { familia: linea.familia as FamiliaProducto, lineas: [] })
    }
    familiasMap.get(linea.familia_id)!.lineas.push(linea)
  })

  const total = lineasCotizables.reduce((sum, linea) => {
    const p = precios[linea.id]
    const precio = parseFloat(p?.precio_unitario || '0')
    const cantidad = parseFloat(p?.cantidad_oferta || '0')
    return precio > 0 && cantidad > 0 ? sum + precio * cantidad : sum
  }, 0)

  async function enviarCotizacion(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const algunPrecio = lineasCotizables.some(l => {
      const p = precios[l.id]
      return p?.precio_unitario && parseFloat(p.precio_unitario) > 0
    })
    if (!algunPrecio) {
      setError('Tenés que completar al menos un precio para enviar la cotización.')
      return
    }

    setCargando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada.'); setCargando(false); return }

    let cotizacionId = cotizacionExistente?.id

    if (!yaCotizo) {
      const { data: nueva, error: errCot } = await supabase
        .from('cotizaciones')
        .insert({
          pedido_id: pedidoId,
          vendedor_id: user.id,
          tiene_financiacion: condiciones.tiene_financiacion,
          descuento_pago_contado: condiciones.descuento_pago_contado,
          entrega_inmediata: condiciones.entrega_inmediata,
          acepta_division: condiciones.acepta_division,
          notas_pago: condiciones.notas_pago || null,
        })
        .select('id')
        .single()

      if (errCot || !nueva) {
        setError('No se pudo crear la cotización. Intentá de nuevo.')
        setCargando(false)
        return
      }
      cotizacionId = nueva.id
    } else {
      const { error: errUpd } = await supabase
        .from('cotizaciones')
        .update({
          tiene_financiacion: condiciones.tiene_financiacion,
          descuento_pago_contado: condiciones.descuento_pago_contado,
          entrega_inmediata: condiciones.entrega_inmediata,
          acepta_division: condiciones.acepta_division,
          notas_pago: condiciones.notas_pago || null,
        })
        .eq('id', cotizacionId)

      if (errUpd) {
        setError('No se pudo actualizar la cotización.')
        setCargando(false)
        return
      }

      await supabase
        .from('lineas_cotizacion')
        .delete()
        .eq('cotizacion_id', cotizacionId)
    }

    const lineasParaInsertar = lineasCotizables
      .map(linea => {
        const p = precios[linea.id]
        const precio = parseFloat(p?.precio_unitario || '0')
        const cantidad = parseFloat(p?.cantidad_oferta || '0')
        return {
          cotizacion_id: cotizacionId!,
          linea_pedido_id: linea.id,
          precio_unitario: precio > 0 ? precio : null,
          cantidad_oferta: cantidad > 0 ? cantidad : null,
          notas: p?.notas || null,
        }
      })
      .filter(l => l.precio_unitario !== null)

    if (lineasParaInsertar.length > 0) {
      const { error: errLineas } = await supabase
        .from('lineas_cotizacion')
        .insert(lineasParaInsertar)

      if (errLineas) {
        setError('No se pudieron guardar los precios. Intentá de nuevo.')
        setCargando(false)
        return
      }
    }

    setExito(true)
    setTimeout(() => {
      router.push('/vendedor/pedidos')
      router.refresh()
    }, 1500)
  }

  // ── Estado: pedido cerrado ─────────────────────────────────────────────────
  if (esCerrada) {
    return (
      <div className="tarjeta text-center py-10">
        {cotizacionExistente.ganadora ? (
          <>
            <p className="text-4xl mb-3">🏆</p>
            <h3 className="text-lg font-semibold text-on-surface mb-1">¡Tu cotización fue seleccionada!</h3>
            <p className="text-sm text-on-surface-variant">Coordiná la entrega directamente con el comprador.</p>
          </>
        ) : (
          <>
            <p className="text-3xl mb-3">📋</p>
            <h3 className="text-lg font-semibold text-on-surface mb-1">El comprador eligió otro proveedor</h3>
            <p className="text-sm text-on-surface-variant">Gracias por cotizar. Seguí participando en otros pedidos.</p>
          </>
        )}
      </div>
    )
  }

  // ── Estado: envío exitoso ─────────────────────────────────────────────────
  if (exito) {
    return (
      <div className="tarjeta text-center py-10">
        <p className="text-4xl mb-3">✅</p>
        <h3 className="text-lg font-semibold text-on-surface">
          {yaCotizo ? 'Cotización actualizada' : '¡Cotización enviada!'}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">Redirigiendo...</p>
      </div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={enviarCotizacion} className="space-y-5">

      {/* Precios por ítem, agrupados por familia */}
      <div className="tarjeta">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-semibold text-on-surface">
              {yaCotizo ? 'Actualizar cotización' : 'Completá tu cotización'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Precio por unidad. Dejá en blanco los ítems que no podés cotizar.
            </p>
          </div>
          {total > 0 && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-on-surface-variant">Total</p>
              <p className="text-xl font-bold text-on-surface">{formatearPrecio(total)}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {Array.from(familiasMap.entries()).map(([familia_id, { familia, lineas: ls }]) => (
            <div key={familia_id}>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3 pb-1 border-b border-outline-variant/20">
                {familia?.nombre}
              </h3>

              <div className="space-y-2">
                {ls.map(linea => {
                  const p = precios[linea.id]
                  const precio = parseFloat(p?.precio_unitario || '0')
                  const cantidad = parseFloat(p?.cantidad_oferta || '0')
                  const subtotal = precio > 0 && cantidad > 0 ? precio * cantidad : null
                  const tienePrecio = precio > 0

                  return (
                    <div
                      key={linea.id}
                      className={`rounded-xl border p-3 transition-colors ${
                        tienePrecio
                          ? 'border-primary/30 bg-primary-fixed/10'
                          : 'border-outline-variant/20 bg-surface-container-lowest'
                      }`}
                    >
                      {/* Descripción del ítem */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface">{linea.descripcion}</p>
                          {linea.notas && (
                            <p className="text-xs text-on-surface-variant mt-0.5">{linea.notas}</p>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant whitespace-nowrap flex-shrink-0 bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/20">
                          Pedido: {linea.cantidad} {linea.unidad}
                        </span>
                      </div>

                      {/* Inputs: precio + cantidad + subtotal */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="text-xs text-on-surface-variant mb-1 block">
                            Precio unitario
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input text-sm pl-6"
                              placeholder="0.00"
                              value={p?.precio_unitario ?? ''}
                              onChange={e => actualizarPrecio(linea.id, 'precio_unitario', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-on-surface-variant mb-1 block">
                            Cant. a ofrecer <span className="text-on-surface-variant/50">({linea.unidad})</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input text-sm"
                            value={p?.cantidad_oferta ?? ''}
                            onChange={e => actualizarPrecio(linea.id, 'cantidad_oferta', e.target.value)}
                          />
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs text-on-surface-variant mb-1">Subtotal</p>
                          {subtotal !== null ? (
                            <p className="text-sm font-semibold text-primary leading-9">{formatearPrecio(subtotal)}</p>
                          ) : (
                            <p className="text-sm text-on-surface-variant leading-9">—</p>
                          )}
                        </div>
                      </div>

                      {/* Notas del ítem */}
                      <div className="mt-2">
                        <input
                          type="text"
                          className="input text-xs text-on-surface-variant"
                          placeholder="Notas del ítem: marca, variante, condición especial... (opcional)"
                          value={p?.notas ?? ''}
                          onChange={e => actualizarPrecio(linea.id, 'notas', e.target.value)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Total al pie del card de ítems */}
        {total > 0 && (
          <div className="mt-5 pt-4 border-t border-outline-variant/20 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Total cotización</p>
              <p className="text-2xl font-bold text-on-surface">{formatearPrecio(total)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Condiciones comerciales */}
      <div className="tarjeta">
        <h2 className="font-semibold text-on-surface mb-4">Condiciones comerciales</h2>

        <div className="space-y-3">
          {([
            {
              campo: 'tiene_financiacion',
              label: 'Ofrezco financiación',
              descripcion: 'Posibilidad de pago en cuotas o plazo extendido',
            },
            {
              campo: 'descuento_pago_contado',
              label: 'Descuento por pago en efectivo',
              descripcion: 'Precio especial si se paga al momento de la entrega',
            },
            {
              campo: 'entrega_inmediata',
              label: 'Entrega inmediata',
              descripcion: 'Tengo stock disponible para entregar sin demora',
            },
          ] as const).map(({ campo, label, descripcion }) => (
            <label key={campo} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-outline accent-primary"
                checked={condiciones[campo]}
                onChange={e => setCondiciones(c => ({ ...c, [campo]: e.target.checked }))}
              />
              <div>
                <p className="text-sm font-medium text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">{descripcion}</p>
              </div>
            </label>
          ))}

          {/* Separador visual */}
          <div className="border-t border-outline-variant/20 pt-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-outline accent-primary"
                checked={!condiciones.acepta_division}
                onChange={e => setCondiciones(c => ({ ...c, acepta_division: !e.target.checked }))}
              />
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Precios válidos solo si compran todo lo cotizado
                </p>
                <p className="text-xs text-on-surface-variant">
                  Marcá esto si tus precios dependen de que te compren la totalidad de los ítems que ofertaste.
                  Si no marcás, el comprador puede elegirte solo para algunas familias de productos.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="label">
            Notas de pago <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="ej: Acepto transferencia bancaria o cheque a 30 días. Precio final sujeto a confirmación de stock."
            value={condiciones.notas_pago}
            onChange={e => setCondiciones(c => ({ ...c, notas_pago: e.target.value }))}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pb-4">
        <Link href="/vendedor/pedidos" className="btn-secundario">
          Cancelar
        </Link>
        <button type="submit" disabled={cargando} className="btn-primario">
          {cargando
            ? 'Enviando...'
            : yaCotizo
            ? 'Actualizar cotización'
            : 'Enviar cotización →'
          }
        </button>
      </div>
    </form>
  )
}
