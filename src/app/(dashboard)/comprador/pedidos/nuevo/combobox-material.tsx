'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface OpcionCatalogo {
  descripcion: string  // valor completo: "Grupo — Variante"
  grupo: string
  variante: string
  unidad: string
}

interface Props {
  data: Record<string, Array<{ variante: string; unidad: string }>>
  value: string
  onChange: (descripcion: string, unidad?: string) => void
  placeholder?: string
}

export function ComboboxMaterial({ data, value, onChange, placeholder = 'Buscar material...' }: Props) {
  const [query, setQuery] = useState(value)
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)

  // Aplanar el catálogo — se recalcula solo si cambia `data`
  const todos = useMemo<OpcionCatalogo[]>(() => {
    const acc: OpcionCatalogo[] = []
    for (const [grupo, variantes] of Object.entries(data)) {
      for (const v of variantes) {
        acc.push({ descripcion: `${grupo} — ${v.variante}`, grupo, variante: v.variante, unidad: v.unidad })
      }
    }
    return acc
  }, [data])

  // Sincronizar cuando el padre resetea el valor (ej: nueva línea vacía)
  useEffect(() => { setQuery(value) }, [value])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll automático al ítem resaltado
  useEffect(() => {
    if (!listaRef.current) return
    const el = listaRef.current.querySelector<HTMLElement>('[data-resaltado="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [resaltado])

  const q = query.trim().toLowerCase()
  const filtrados = q.length === 0
    ? []
    : todos.filter(o =>
        o.variante.toLowerCase().includes(q) ||
        o.grupo.toLowerCase().includes(q)
      ).slice(0, 60)

  // Agrupar resultados preservando el índice global para el resaltado
  const grupos = new Map<string, { opcion: OpcionCatalogo; idx: number }[]>()
  filtrados.forEach((opcion, idx) => {
    if (!grupos.has(opcion.grupo)) grupos.set(opcion.grupo, [])
    grupos.get(opcion.grupo)!.push({ opcion, idx })
  })

  function seleccionar(opcion: OpcionCatalogo) {
    setQuery(opcion.descripcion)
    onChange(opcion.descripcion, opcion.unidad)
    setAbierto(false)
    setResaltado(0)
  }

  function manejarTecla(e: React.KeyboardEvent) {
    if (!abierto || filtrados.length === 0) {
      if (e.key === 'ArrowDown') { setAbierto(true); setResaltado(0) }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setResaltado(r => Math.min(r + 1, filtrados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setResaltado(r => Math.max(r - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtrados[resaltado]) seleccionar(filtrados[resaltado])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  const mostrarDropdown = abierto && q.length > 0

  function limpiar() {
    setQuery('')
    onChange('')
    setAbierto(false)
  }

  return (
    <div ref={contenedorRef} className="relative">
      {/* Lupa — izquierda, fija, decorativa */}
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none select-none">
        search
      </span>

      <input
        type="text"
        className="input text-sm w-full pl-8 pr-7"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={e => {
          const val = e.target.value
          setQuery(val)
          onChange(val)
          setAbierto(true)
          setResaltado(0)
        }}
        onFocus={() => { if (q.length > 0) setAbierto(true) }}
        onKeyDown={manejarTecla}
      />

      {/* Botón ✕ — derecha, solo cuando hay texto */}
      {query.length > 0 && (
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); limpiar() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          tabIndex={-1}
          aria-label="Limpiar"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}

      {/* Dropdown */}
      {mostrarDropdown && (
        <div
          ref={listaRef}
          className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-outline-variant bg-surface shadow-lg"
        >
          {filtrados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-on-surface-variant">Sin resultados. Podés igualmente escribir lo que necesitás.</p>
          ) : (
            Array.from(grupos.entries()).map(([nombre, opciones]) => (
              <div key={nombre}>
                <div className="sticky top-0 px-3 py-1 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant/20">
                  {nombre}
                </div>
                {opciones.map(({ opcion, idx }) => (
                  <button
                    key={opcion.descripcion}
                    type="button"
                    data-resaltado={idx === resaltado ? 'true' : undefined}
                    onMouseEnter={() => setResaltado(idx)}
                    onMouseDown={() => seleccionar(opcion)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      idx === resaltado
                        ? 'bg-primary-fixed/30 text-on-surface'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {opcion.variante}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
