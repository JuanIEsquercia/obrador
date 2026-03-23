'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import type { Pedido } from '@/types'

export default function AccionesPedido({ pedido }: { pedido: Pedido }) {
  const router = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [confirmarCerrar, setConfirmarCerrar] = useState(false)

  async function publicar() {
    setCargando(true)
    setError(null)

    const { error: err } = await supabase
      .from('pedidos')
      .update({ estado: 'publicado', publicado_en: new Date().toISOString() })
      .eq('id', pedido.id)

    if (err) {
      setError('No se pudo publicar el pedido.')
      setCargando(false)
      return
    }

    router.refresh()
    setCargando(false)
  }

  async function eliminar() {
    setCargando(true)
    setError(null)

    const { error: err } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', pedido.id)

    if (err) {
      setError('No se pudo eliminar el pedido.')
      setCargando(false)
      setConfirmarEliminar(false)
      return
    }

    router.push('/comprador/pedidos')
    router.refresh()
  }

  async function cerrar() {
    setCargando(true)
    setError(null)

    const { error: err } = await supabase
      .from('pedidos')
      .update({ estado: 'cerrado' })
      .eq('id', pedido.id)

    if (err) {
      setError('No se pudo cerrar la licitación.')
      setCargando(false)
      setConfirmarCerrar(false)
      return
    }

    router.refresh()
    setCargando(false)
  }

  if (pedido.estado === 'cerrado') return null

  return (
    <div className="tarjeta sticky top-6 space-y-2">
      <h3 className="font-semibold text-on-surface mb-1">Acciones</h3>

      {error && (
        <div className="rounded-lg bg-error-container/50 border border-error/20 px-3 py-2 text-xs text-error">
          {error}
        </div>
      )}

      {/* ── Borrador ── */}
      {pedido.estado === 'borrador' && (
        <>
          <p className="text-xs text-on-surface-variant pb-2">
            Revisá el pedido antes de publicarlo. Una vez publicado, los proveedores podrán cotizarlo.
          </p>

          <button onClick={publicar} disabled={cargando} className="btn-primario w-full">
            {cargando ? 'Publicando...' : '📢 Publicar licitación'}
          </button>

          <Link href={`/comprador/pedidos/${pedido.id}/editar`} className="btn-secundario w-full text-center block">
            ✏️ Editar pedido
          </Link>

          <div className="pt-2 border-t border-outline-variant/20">
            {!confirmarEliminar ? (
              <button
                onClick={() => setConfirmarEliminar(true)}
                className="w-full text-xs text-error/70 hover:text-error py-2 rounded-lg hover:bg-error-container/30 transition-colors"
              >
                Eliminar borrador
              </button>
            ) : (
              <div className="bg-error-container/30 rounded-lg p-3 space-y-2">
                <p className="text-xs text-on-surface font-medium">¿Eliminar este pedido?</p>
                <p className="text-xs text-on-surface-variant">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmarEliminar(false)} className="flex-1 btn-secundario text-xs py-1.5">
                    Cancelar
                  </button>
                  <button onClick={eliminar} disabled={cargando} className="flex-1 bg-error text-on-error rounded-lg text-xs py-1.5 font-semibold hover:bg-error/90 transition-colors">
                    {cargando ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Publicado ── */}
      {pedido.estado === 'publicado' && (
        <>
          <p className="text-xs text-on-surface-variant pb-2">
            Tu licitación está activa. Los proveedores pueden enviar cotizaciones.
          </p>

          <div className="pt-2 border-t border-outline-variant/20">
            {!confirmarCerrar ? (
              <button
                onClick={() => setConfirmarCerrar(true)}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface py-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                Cerrar licitación
              </button>
            ) : (
              <div className="bg-surface-container rounded-lg p-3 space-y-2">
                <p className="text-xs text-on-surface font-medium">¿Cerrar esta licitación?</p>
                <p className="text-xs text-on-surface-variant">No recibirás más cotizaciones nuevas.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmarCerrar(false)} className="flex-1 btn-secundario text-xs py-1.5">
                    Cancelar
                  </button>
                  <button onClick={cerrar} disabled={cargando} className="flex-1 btn-primario text-xs py-1.5">
                    {cargando ? '...' : 'Cerrar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Progreso ── */}
      <div className="pt-3 border-t border-outline-variant/20">
        <p className="text-xs font-medium text-on-surface-variant mb-2">Estado del proyecto</p>
        <div className="space-y-1.5">
          {[
            { label: 'Pedido creado', hecho: true },
            { label: 'Publicar licitación', hecho: pedido.estado !== 'borrador' },
            { label: 'Recibir cotizaciones', hecho: false, pendiente: pedido.estado === 'publicado' },
            { label: 'Elegir proveedor', hecho: false, pendiente: false },
          ].map(({ label, hecho, pendiente }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                hecho
                  ? 'bg-primary text-on-primary'
                  : pendiente
                    ? 'border-2 border-primary'
                    : 'border-2 border-outline-variant/40'
              }`}>
                {hecho && '✓'}
              </span>
              <span className={hecho ? 'text-on-surface' : pendiente ? 'text-on-surface' : 'text-on-surface-variant opacity-60'}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
