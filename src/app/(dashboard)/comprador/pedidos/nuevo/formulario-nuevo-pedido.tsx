'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import catalogoDataJSON from '@/lib/catalogo-data.json'
import type { FamiliaProducto, ItemLineaPedido } from '@/types'

const catalogoDb = catalogoDataJSON as Record<string, Record<string, Array<{ variante: string, unidad: string }>>>
const UNIDADES = ['unidades', 'kg', 'bolsas', 'm²', 'm³', 'm', 'litros', 'chapas', 'rollos', 'juegos', 'otros']

interface DatosIniciales {
  titulo: string
  descripcion: string
  direccion_entrega: string
  fecha_entrega: string
  fecha_cierre_cotizaciones: string
}

interface Props {
  familias: FamiliaProducto[]
  obraId?: string            // Requerido en modo creación; no aplica en edición
  // Modo edición: se pasan los datos existentes
  pedidoId?: string
  datosIniciales?: DatosIniciales
  lineasIniciales?: ItemLineaPedido[]
}

const lineaVacia = (familia_id: number): ItemLineaPedido => ({
  familia_id,
  descripcion: '',
  cantidad: 1,
  unidad: 'unidades',
  notas: '',
})

export default function FormularioNuevoPedido({ familias, obraId, pedidoId, datosIniciales, lineasIniciales }: Props) {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [accionCargando, setAccionCargando] = useState<'borrador' | 'publicar' | null>(null)
  const cargando = accionCargando !== null
  const [error, setError] = useState<string | null>(null)

  const modoEdicion = !!pedidoId

  // Default cierre: 7 días desde hoy
  const defaultCierre = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [pedido, setPedido] = useState<DatosIniciales>({
    titulo: datosIniciales?.titulo ?? '',
    descripcion: datosIniciales?.descripcion ?? '',
    direccion_entrega: datosIniciales?.direccion_entrega ?? '',
    fecha_entrega: datosIniciales?.fecha_entrega ?? '',
    fecha_cierre_cotizaciones: datosIniciales?.fecha_cierre_cotizaciones ?? defaultCierre,
  })

  const [familiaActiva, setFamiliaActiva] = useState<number | null>(null)
  const [lineas, setLineas] = useState<ItemLineaPedido[]>(lineasIniciales ?? [])

  function agregarFamilia(familia_id: number) {
    if (familiaActiva !== familia_id) setFamiliaActiva(familia_id)
    const yaHay = lineas.some(l => l.familia_id === familia_id)
    if (!yaHay) setLineas(prev => [...prev, lineaVacia(familia_id)])
  }

  function agregarItem(familia_id: number) {
    setLineas(prev => [...prev, lineaVacia(familia_id)])
  }

  function actualizarLinea(index: number, campo: keyof ItemLineaPedido, valor: string | number) {
    setLineas(prev => {
      const nuevas = [...prev]
      nuevas[index] = { ...nuevas[index], [campo]: valor }
      return nuevas
    })
  }

  function eliminarLinea(index: number) {
    setLineas(prev => prev.filter((_, i) => i !== index))
  }

  const familiasTengo = [...new Set(lineas.map(l => l.familia_id))]

  async function guardar(publicar: boolean) {
    setError(null)

    if (!pedido.titulo.trim()) { setError('El título del pedido es requerido.'); return }
    if (!pedido.direccion_entrega.trim()) { setError('La dirección de entrega es requerida.'); return }
    if (!pedido.fecha_cierre_cotizaciones) { setError('La fecha límite de cotizaciones es requerida.'); return }
    if (!pedido.fecha_entrega) { setError('La fecha de entrega es requerida.'); return }
    if (pedido.fecha_cierre_cotizaciones >= pedido.fecha_entrega) {
      setError('La fecha límite de cotizaciones debe ser anterior a la fecha de entrega.')
      return
    }
    if (lineas.length === 0) { setError('Agregá al menos un ítem al pedido.'); return }
    if (lineas.some(l => !l.descripcion.trim() || !l.cantidad || !l.unidad)) {
      setError('Completá todos los campos de los ítems (descripción, cantidad y unidad).')
      return
    }

    if (!modoEdicion && !obraId) {
      setError('Error interno: falta el ID de la obra. Volvé a la obra e intentá de nuevo.')
      return
    }

    setAccionCargando(publicar ? 'publicar' : 'borrador')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada.'); setAccionCargando(null); return }

    if (modoEdicion) {
      // ── Modo edición: UPDATE pedido + reemplazar líneas ──
      const { error: errUpdate } = await supabase
        .from('pedidos')
        .update({
          titulo: pedido.titulo,
          descripcion: pedido.descripcion || null,
          direccion_entrega: pedido.direccion_entrega,
          fecha_entrega: pedido.fecha_entrega,
          fecha_cierre_cotizaciones: pedido.fecha_cierre_cotizaciones || null,
        })
        .eq('id', pedidoId)
        .eq('comprador_id', user.id)

      if (errUpdate) {
        setError('No se pudo actualizar el pedido.')
        setAccionCargando(null)
        return
      }

      // Borrar líneas existentes y reemplazar
      await supabase.from('lineas_pedido').delete().eq('pedido_id', pedidoId)

      const { error: errLineas } = await supabase.from('lineas_pedido').insert(
        lineas.map((linea, i) => ({
          pedido_id: pedidoId,
          familia_id: linea.familia_id,
          descripcion: linea.descripcion,
          cantidad: linea.cantidad,
          unidad: linea.unidad,
          notas: linea.notas || null,
          orden: i,
        }))
      )

      if (errLineas) {
        setError('Se actualizó el pedido pero hubo un problema con los ítems.')
        setAccionCargando(null)
        return
      }

      if (publicar) {
        await supabase
          .from('pedidos')
          .update({ estado: 'publicado', publicado_en: new Date().toISOString() })
          .eq('id', pedidoId)
      }

      router.push(`/comprador/obras/${obraId}/licitaciones/${pedidoId}`)
      router.refresh()
      return
    }

    // ── Modo creación ──
    const nuevoId = crypto.randomUUID()

    const { error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        id: nuevoId,
        comprador_id: user.id,
        obra_id: obraId,
        titulo: pedido.titulo,
        descripcion: pedido.descripcion || null,
        direccion_entrega: pedido.direccion_entrega,
        fecha_entrega: pedido.fecha_entrega,
        fecha_cierre_cotizaciones: pedido.fecha_cierre_cotizaciones || null,
        estado: 'borrador',
        publicado_en: null,
      })

    if (errPedido) {
      setError('No se pudo crear el pedido. Intentá de nuevo.')
      setAccionCargando(null)
      return
    }

    const { error: errLineas } = await supabase.from('lineas_pedido').insert(
      lineas.map((linea, i) => ({
        pedido_id: nuevoId,
        familia_id: linea.familia_id,
        descripcion: linea.descripcion,
        cantidad: linea.cantidad,
        unidad: linea.unidad,
        notas: linea.notas || null,
        orden: i,
      }))
    )

    if (errLineas) {
      setError('Se creó el pedido pero hubo un problema con los ítems. Intentá de nuevo.')
      setAccionCargando(null)
      return
    }

    if (publicar) {
      await supabase
        .from('pedidos')
        .update({ estado: 'publicado', publicado_en: new Date().toISOString() })
        .eq('id', nuevoId)
    }

    router.push(`/comprador/obras/${obraId}/licitaciones/${nuevoId}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Datos generales */}
      <div className="tarjeta space-y-4">
        <h2 className="font-semibold text-on-surface">Datos del pedido</h2>

        <div>
          <label className="label">Título del pedido</label>
          <input
            type="text"
            className="input"
            placeholder="ej: Materiales para planta baja — Obra Las Heras"
            value={pedido.titulo}
            onChange={e => setPedido(p => ({ ...p, titulo: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">
            Descripción <span className="text-on-surface-variant font-normal">(opcional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Información adicional para los proveedores..."
            value={pedido.descripcion}
            onChange={e => setPedido(p => ({ ...p, descripcion: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Dirección de entrega</label>
          <input
            type="text"
            className="input"
            placeholder="Calle 123, Corrientes Capital"
            value={pedido.direccion_entrega}
            onChange={e => setPedido(p => ({ ...p, direccion_entrega: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha límite de cotizaciones</label>
            <input
              type="date"
              className="input"
              min={new Date().toISOString().split('T')[0]}
              value={pedido.fecha_cierre_cotizaciones}
              onChange={e => setPedido(p => ({ ...p, fecha_cierre_cotizaciones: e.target.value }))}
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Hasta cuándo aceptás ofertas de proveedores
            </p>
          </div>
          <div>
            <label className="label">Fecha de entrega requerida</label>
            <input
              type="date"
              className="input"
              min={pedido.fecha_cierre_cotizaciones || new Date().toISOString().split('T')[0]}
              value={pedido.fecha_entrega}
              onChange={e => setPedido(p => ({ ...p, fecha_entrega: e.target.value }))}
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Cuándo necesitás el material en obra
            </p>
          </div>
        </div>
      </div>

      {/* Selector de familias */}
      <div className="tarjeta">
        <h2 className="font-semibold text-on-surface mb-3">¿Qué materiales necesitás?</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Hacé clic en una familia para agregar ítems.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {familias.map(familia => {
            const tieneLineas = lineas.some(l => l.familia_id === familia.id)
            return (
              <button
                key={familia.id}
                type="button"
                onClick={() => agregarFamilia(familia.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                  tieneLineas
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-on-surface border-outline hover:border-primary hover:text-primary'
                }`}
              >
                {tieneLineas && '✓ '}{familia.nombre}
              </button>
            )
          })}
        </div>

        {familiasTengo.length > 0 && (
          <div className="space-y-6">
            {familiasTengo.map(familia_id => {
              const familia = familias.find(f => f.id === familia_id)
              const itemsFamilia = lineas
                .map((l, i) => ({ linea: l, index: i }))
                .filter(({ linea }) => linea.familia_id === familia_id)

              const dataFamilia = catalogoDb[familia?.nombre || ''] || {}
              const productos = Object.keys(dataFamilia)

              return (
                <div key={familia_id} className="border border-outline-variant rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-on-surface text-sm">{familia?.nombre}</h3>
                    <button
                      type="button"
                      onClick={() => agregarItem(familia_id)}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      + Agregar ítem
                    </button>
                  </div>

                  <div className="space-y-3">
                    {itemsFamilia.map(({ linea, index }) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          {index === itemsFamilia[0].index && (
                            <p className="text-xs text-on-surface-variant mb-1">Descripción</p>
                          )}
                          {productos.length > 0 ? (
                            <select 
                              className="input text-sm truncate"
                              value={linea.descripcion}
                              onChange={e => {
                                const descMatch = e.target.value;
                                actualizarLinea(index, 'descripcion', descMatch);
                                // Autocompletar la unidad
                                for (const p of productos) {
                                  const match = dataFamilia[p].find(v => `${p} — ${v.variante}` === descMatch);
                                  if (match) {
                                    actualizarLinea(index, 'unidad', match.unidad);
                                    break;
                                  }
                                }
                              }}
                            >
                              <option value="">Seleccionar material...</option>
                              {productos.map(prod => (
                                <optgroup key={prod} label={prod}>
                                  {dataFamilia[prod].map(v => {
                                    const labelStr = `${prod} — ${v.variante}`;
                                    return (
                                      <option key={labelStr} value={labelStr}>
                                        {v.variante}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              ))}
                            </select>
                          ) : (
                            <input type="text" className="input text-sm" placeholder="ej: Ladrillo hueco 18x18x33"
                              value={linea.descripcion} onChange={e => actualizarLinea(index, 'descripcion', e.target.value)} />
                          )}
                        </div>
                        <div className="col-span-2">
                          {index === itemsFamilia[0].index && (
                            <p className="text-xs text-on-surface-variant mb-1">Cantidad</p>
                          )}
                          <input type="number" min="0.01" step="0.01" className="input text-sm"
                            value={linea.cantidad} onChange={e => actualizarLinea(index, 'cantidad', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="col-span-2">
                          {index === itemsFamilia[0].index && (
                            <p className="text-xs text-on-surface-variant mb-1">Unidad</p>
                          )}
                          <select className="input text-sm" value={linea.unidad}
                            onChange={e => actualizarLinea(index, 'unidad', e.target.value)}>
                            {Array.from(new Set([...UNIDADES, linea.unidad])).map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          {index === itemsFamilia[0].index && (
                            <p className="text-xs text-on-surface-variant mb-1">Notas</p>
                          )}
                          <input type="text" className="input text-sm" placeholder="Opcional"
                            value={linea.notas} onChange={e => actualizarLinea(index, 'notas', e.target.value)} />
                        </div>
                        <div className={`col-span-1 flex ${index === itemsFamilia[0].index ? 'items-end pb-0.5 mt-5' : 'items-center'}`}>
                          <button type="button" onClick={() => eliminarLinea(index)}
                            className="text-on-surface-variant hover:text-error p-1.5 rounded" title="Eliminar ítem">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={() => guardar(false)} disabled={cargando} className="btn-secundario">
          {accionCargando === 'borrador'
            ? 'Guardando...'
            : modoEdicion ? 'Guardar cambios' : 'Guardar borrador'}
        </button>
        <button type="button" onClick={() => guardar(true)} disabled={cargando} className="btn-primario">
          {accionCargando === 'publicar'
            ? 'Publicando...'
            : modoEdicion ? 'Guardar y publicar →' : 'Publicar pedido →'}
        </button>
      </div>

      <p className="text-xs text-on-surface-variant text-right">
        Al publicar, los proveedores disponibles serán notificados automáticamente.
      </p>
    </div>
  )
}
