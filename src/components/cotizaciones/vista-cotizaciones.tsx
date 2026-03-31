'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import { formatearPrecio, calcularTotalCotizacion } from '@/lib/utils'
import type { LineaPedido, CotizacionConLineas } from '@/types'

interface Props {
  lineas: LineaPedido[]
  cotizaciones: CotizacionConLineas[]
  pedidoId: string
  pedidoCerrado: boolean
}

export default function VistaCotizaciones({ lineas, cotizaciones, pedidoId, pedidoCerrado }: Props) {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [seleccionando, setSeleccionando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalConfirmar, setModalConfirmar] = useState<string | null>(null)

  async function seleccionarGanadora(cotizacionId: string) {
    setSeleccionando(cotizacionId)
    setError(null)

    const { error: err } = await supabase.rpc('seleccionar_cotizacion_ganadora', {
      p_cotizacion_id: cotizacionId,
      p_pedido_id: pedidoId,
    })

    if (err) {
      setError('No se pudo seleccionar al proveedor. Intentá de nuevo.')
      setSeleccionando(null)
      return
    }

    setModalConfirmar(null)
    router.refresh()
  }

  const totales = cotizaciones.map(cot => ({
    id: cot.id,
    total: calcularTotalCotizacion(cot.lineas),
  }))

  const totalMinimo = Math.min(...totales.map(t => t.total).filter(t => t > 0))

  const familiasMap = new Map<number, { nombre: string; lineas: LineaPedido[] }>()
  lineas.forEach(linea => {
    if (!familiasMap.has(linea.familia_id)) {
      familiasMap.set(linea.familia_id, { nombre: linea.familia?.nombre ?? '', lineas: [] })
    }
    familiasMap.get(linea.familia_id)!.lineas.push(linea)
  })

  return (
    <div>
      {/* Resumen de totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {cotizaciones.map(cot => {
          const totalCot = totales.find(t => t.id === cot.id)?.total ?? 0
          const esMenor = totalCot === totalMinimo && totalCot > 0
          const esGanadora = cot.ganadora === true
          const esNoSeleccionada = cot.ganadora === false

          return (
            <div
              key={cot.id}
              className={`rounded-xl border-2 p-4 ${
                esGanadora
                  ? 'border-primary bg-primary-fixed/30'
                  : esNoSeleccionada
                  ? 'border-outline-variant/30 bg-surface-container opacity-60'
                  : esMenor
                  ? 'border-primary/40 bg-primary-fixed/10'
                  : 'border-outline-variant/30 bg-surface-container-lowest'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-on-surface text-sm">{cot.vendedor.empresa}</p>
                  <p className="text-xs text-on-surface-variant">{cot.vendedor.nombre}</p>
                </div>
                {esGanadora && (
                  <span className="badge bg-primary-fixed text-primary text-xs">🏆 Elegido</span>
                )}
                {esMenor && !esGanadora && !pedidoCerrado && (
                  <span className="badge bg-primary-fixed/50 text-primary text-xs">Menor precio</span>
                )}
              </div>

              <p className="text-2xl font-bold text-on-surface mb-2">
                {totalCot > 0 ? formatearPrecio(totalCot) : <span className="text-base text-on-surface-variant">Sin total</span>}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {cot.tiene_financiacion && (
                  <span className="badge bg-tertiary-fixed/50 text-tertiary text-xs">Financiación</span>
                )}
                {cot.descuento_pago_contado && (
                  <span className="badge bg-secondary-fixed/50 text-secondary text-xs">Dcto. contado</span>
                )}
                {cot.entrega_inmediata && (
                  <span className="badge bg-primary-fixed/50 text-primary text-xs">Entrega inmediata</span>
                )}
              </div>

              {cot.acepta_division === false && (
                <span className="badge bg-error-container text-error text-xs mb-2 block w-fit">
                  Compra total requerida
                </span>
              )}

              {cot.notas_pago && (
                <p className="text-xs text-on-surface-variant mb-3 italic">&ldquo;{cot.notas_pago}&rdquo;</p>
              )}

              {!pedidoCerrado && cot.ganadora === null && (
                <button
                  onClick={() => setModalConfirmar(cot.id)}
                  disabled={seleccionando !== null}
                  className="btn-primario w-full text-xs py-2"
                >
                  Elegir este proveedor
                </button>
              )}

              {esGanadora && cot.vendedor.telefono && (
                <div className="mt-2 p-2 bg-primary-fixed/40 rounded-lg">
                  <p className="text-xs text-primary font-medium">Contacto del proveedor:</p>
                  <p className="text-xs text-primary">{cot.vendedor.telefono}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error mb-4">
          {error}
        </div>
      )}

      {/* Tabla comparativa */}
      <div className="tarjeta">
        <h3 className="font-semibold text-on-surface mb-4">Comparativa ítem por ítem</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left font-medium text-on-surface-variant pb-3 pr-4 min-w-[200px]">Ítem</th>
                <th className="text-center font-medium text-on-surface-variant pb-3 px-3 whitespace-nowrap">Cant. pedida</th>
                {cotizaciones.map(cot => (
                  <th
                    key={cot.id}
                    className={`text-center font-medium pb-3 px-3 whitespace-nowrap ${
                      cot.ganadora === true ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {cot.vendedor.empresa}
                    {cot.ganadora === true && ' 🏆'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(familiasMap.entries()).map(([familia_id, { nombre, lineas: ls }]) => (
                <Fragment key={`familia-${familia_id}`}>
                  <tr>
                    <td
                      colSpan={2 + cotizaciones.length}
                      className="pt-4 pb-1 text-xs font-semibold text-on-surface-variant uppercase tracking-wide"
                    >
                      {nombre}
                    </td>
                  </tr>
                  {ls.map(linea => (
                    <tr key={linea.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-on-surface">{linea.descripcion}</p>
                        {linea.notas && <p className="text-xs text-on-surface-variant">{linea.notas}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-center text-on-surface-variant whitespace-nowrap">
                        {linea.cantidad} {linea.unidad}
                      </td>
                      {cotizaciones.map(cot => {
                        const lineaCot = cot.lineas.find(lc => lc.linea_pedido_id === linea.id)
                        const precio = lineaCot?.precio_unitario
                        const cantidad = lineaCot?.cantidad_oferta
                        const preciosMenores = cotizaciones
                          .map(c => c.lineas.find(lc => lc.linea_pedido_id === linea.id)?.precio_unitario)
                          .filter((p): p is number => p != null && p > 0)
                        const menorPrecio = preciosMenores.length > 0 ? Math.min(...preciosMenores) : null
                        const esMenorPrecio = precio != null && precio > 0 && precio === menorPrecio

                        return (
                          <td
                            key={cot.id}
                            className={`py-2.5 px-3 text-center ${cot.ganadora === false ? 'opacity-50' : ''}`}
                          >
                            {precio != null ? (
                              <div>
                                <span className={`font-medium ${esMenorPrecio ? 'text-primary' : 'text-on-surface'}`}>
                                  {formatearPrecio(precio)}
                                </span>
                                {esMenorPrecio && cotizaciones.length > 1 && (
                                  <span className="text-primary ml-1 text-xs">↓</span>
                                )}
                                
                                {lineaCot?.marca_ofertada && (
                                  <p className="text-xs font-bold text-primary mt-1">{lineaCot.marca_ofertada}</p>
                                )}
                                {lineaCot?.variante_ofertada && (
                                  <p className="text-[11px] text-on-surface-variant">{lineaCot.variante_ofertada}</p>
                                )}

                                {cantidad != null && cantidad !== linea.cantidad && (
                                  <p className="text-xs text-secondary mt-0.5">Ofrece: {cantidad} {linea.unidad}</p>
                                )}
                                {lineaCot?.notas && (
                                  <p className="text-[11px] text-on-surface-variant italic mt-0.5 border-t border-outline-variant/20 pt-1">
                                    {lineaCot.notas}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-outline">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}

              <tr className="border-t-2 border-outline-variant bg-surface-container-low">
                <td className="py-3 pr-4 font-bold text-on-surface">Total</td>
                <td className="py-3 px-3" />
                {cotizaciones.map(cot => {
                  const total = totales.find(t => t.id === cot.id)?.total ?? 0
                  const esMenorTotal = total === totalMinimo && total > 0
                  return (
                    <td
                      key={cot.id}
                      className={`py-3 px-3 text-center font-bold ${esMenorTotal ? 'text-primary' : 'text-on-surface'} ${cot.ganadora === false ? 'opacity-50' : ''}`}
                    >
                      {total > 0 ? formatearPrecio(total) : '—'}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalConfirmar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-on-surface mb-2">¿Confirmar selección?</h3>
            <p className="text-sm text-on-surface-variant mb-1">
              Vas a elegir a{' '}
              <strong className="text-on-surface">
                {cotizaciones.find(c => c.id === modalConfirmar)?.vendedor.empresa}
              </strong>{' '}
              como proveedor ganador.
            </p>
            <p className="text-sm text-on-surface-variant mb-5">
              Esta acción va a cerrar el pedido. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmar(null)} className="btn-secundario flex-1">
                Cancelar
              </button>
              <button
                onClick={() => seleccionarGanadora(modalConfirmar)}
                disabled={seleccionando !== null}
                className="btn-primario flex-1"
              >
                {seleccionando ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
