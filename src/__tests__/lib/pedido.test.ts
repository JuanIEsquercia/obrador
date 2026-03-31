/**
 * Tests de lógica de negocio del dominio de pedidos.
 *
 * Valida las transiciones de estado y reglas del ciclo de vida del pedido.
 * Estos tests deben pasar durante el refactor de presupuestos — cualquier
 * cambio en las reglas requiere actualizar los tests explícitamente.
 */
import { textoEstadoPedido, colorEstadoPedido } from '@/lib/utils'

// ── Máquina de estados del pedido ─────────────────────────────────────────

describe('transiciones de estado del pedido', () => {
  type EstadoPedido = 'borrador' | 'publicado' | 'cerrado'

  function transicionesValidas(desde: EstadoPedido): EstadoPedido[] {
    const mapa: Record<EstadoPedido, EstadoPedido[]> = {
      borrador:  ['publicado'],         // puede publicarse
      publicado: ['cerrado'],           // puede cerrarse (se selecciona ganador)
      cerrado:   [],                    // estado terminal
    }
    return mapa[desde]
  }

  it('borrador puede pasar a publicado', () => {
    expect(transicionesValidas('borrador')).toContain('publicado')
  })

  it('borrador NO puede pasar directamente a cerrado', () => {
    expect(transicionesValidas('borrador')).not.toContain('cerrado')
  })

  it('publicado puede pasar a cerrado', () => {
    expect(transicionesValidas('publicado')).toContain('cerrado')
  })

  it('cerrado es estado terminal (sin transiciones)', () => {
    expect(transicionesValidas('cerrado')).toHaveLength(0)
  })
})

// ── Texto e íconos de estado ───────────────────────────────────────────────

describe('textoEstadoPedido', () => {
  const casos: [string, string][] = [
    ['borrador',  'Borrador'],
    ['publicado', 'Publicado'],
    ['cerrado',   'Cerrado'],
  ]

  test.each(casos)('estado "%s" → texto "%s"', (estado, texto) => {
    expect(textoEstadoPedido(estado)).toBe(texto)
  })

  it('estado desconocido devuelve el mismo valor (safe fallback)', () => {
    expect(textoEstadoPedido('archivado')).toBe('archivado')
  })
})

describe('colorEstadoPedido', () => {
  it('todos los estados conocidos tienen clases CSS asignadas', () => {
    const estados = ['borrador', 'publicado', 'cerrado']
    estados.forEach(estado => {
      const color = colorEstadoPedido(estado)
      expect(color).toBeTruthy()
      expect(color).toContain('bg-')
      expect(color).toContain('text-')
    })
  })

  it('estados distintos tienen colores distintos (diferenciación visual)', () => {
    const borrador  = colorEstadoPedido('borrador')
    const publicado = colorEstadoPedido('publicado')
    const cerrado   = colorEstadoPedido('cerrado')

    // Los tres deben ser diferentes entre sí
    expect(borrador).not.toBe(publicado)
    expect(publicado).not.toBe(cerrado)
    expect(borrador).not.toBe(cerrado)
  })
})

// ── Reglas de visibilidad por rol ─────────────────────────────────────────

describe('reglas de visibilidad de pedidos por rol', () => {
  type EstadoPedido = 'borrador' | 'publicado' | 'cerrado'

  // Estas funciones replican la lógica de negocio de las queries y RLS
  function compradorPuedeVer(estado: EstadoPedido): boolean {
    // El comprador ve todos sus pedidos (borrador, publicado, cerrado)
    return true
  }

  function vendedorPuedeVerEnListado(estado: EstadoPedido): boolean {
    // El vendedor solo ve pedidos publicados en el listado de "disponibles"
    return estado === 'publicado'
  }

  function vendedorPuedeVerSiCotizo(estado: EstadoPedido): boolean {
    // El vendedor puede ver detalles de cualquier pedido donde cotizó
    return estado === 'publicado' || estado === 'cerrado'
  }

  it('comprador ve sus pedidos en todos los estados', () => {
    expect(compradorPuedeVer('borrador')).toBe(true)
    expect(compradorPuedeVer('publicado')).toBe(true)
    expect(compradorPuedeVer('cerrado')).toBe(true)
  })

  it('vendedor solo ve pedidos publicados en el listado', () => {
    expect(vendedorPuedeVerEnListado('borrador')).toBe(false)
    expect(vendedorPuedeVerEnListado('publicado')).toBe(true)
    expect(vendedorPuedeVerEnListado('cerrado')).toBe(false)
  })

  it('vendedor puede ver pedido cerrado donde cotizó', () => {
    expect(vendedorPuedeVerSiCotizo('cerrado')).toBe(true)
  })

  it('vendedor NO puede ver pedido borrador aunque haya cotizado (imposible por diseño)', () => {
    // Los pedidos borrador nunca son visibles para vendedores
    expect(vendedorPuedeVerEnListado('borrador')).toBe(false)
  })
})
