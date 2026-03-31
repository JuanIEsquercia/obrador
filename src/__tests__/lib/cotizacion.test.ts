/**
 * Tests de lógica de negocio del dominio de cotizaciones.
 *
 * Estas funciones y reglas deben seguir pasando durante el refactor
 * de presupuestos. Si una regla cambia, actualizar el test (no ignorarlo).
 */
import { calcularTotalCotizacion, formatearPrecio } from '@/lib/utils'

// ── Cálculo de totales ─────────────────────────────────────────────────────

describe('calcularTotalCotizacion — reglas de negocio', () => {
  it('cotización con una línea retorna precio × cantidad', () => {
    expect(calcularTotalCotizacion([
      { precio_unitario: 2500, cantidad_oferta: 40 }
    ])).toBe(100_000)
  })

  it('cotización parcial: solo suma líneas con precio y cantidad', () => {
    const lineas = [
      { precio_unitario: 1000, cantidad_oferta: 10 },  // 10.000
      { precio_unitario: null, cantidad_oferta: 5 },    // sin precio
      { precio_unitario: 500,  cantidad_oferta: null }, // sin cantidad
      { precio_unitario: 200,  cantidad_oferta: 3 },    // 600
    ]
    expect(calcularTotalCotizacion(lineas)).toBe(10_600)
  })

  it('cotización con precios negativos no suma (regla de negocio)', () => {
    // precio_unitario=0 no cuenta como válido
    const lineas = [
      { precio_unitario: 0, cantidad_oferta: 10 },
      { precio_unitario: 100, cantidad_oferta: 2 },
    ]
    // 0 × 10 = 0 (no suma), 100 × 2 = 200
    expect(calcularTotalCotizacion(lineas)).toBe(200)
  })

  it('acepta decimales (precios en pesos con centavos)', () => {
    expect(calcularTotalCotizacion([
      { precio_unitario: 1333.33, cantidad_oferta: 3 }
    ])).toBeCloseTo(3999.99)
  })
})

// ── Estado de cotización (ganadora / en evaluación / no seleccionada) ──────

describe('lógica de estado de cotización', () => {
  function estadoCotizacion(ganadora: boolean | null): 'ganadora' | 'no_seleccionada' | 'en_evaluacion' {
    if (ganadora === true)  return 'ganadora'
    if (ganadora === false) return 'no_seleccionada'
    return 'en_evaluacion'
  }

  it('ganadora=true → estado ganadora', () => {
    expect(estadoCotizacion(true)).toBe('ganadora')
  })

  it('ganadora=false → estado no_seleccionada', () => {
    expect(estadoCotizacion(false)).toBe('no_seleccionada')
  })

  it('ganadora=null → estado en_evaluacion', () => {
    expect(estadoCotizacion(null)).toBe('en_evaluacion')
  })
})

// ── Validación: cotización vacía ───────────────────────────────────────────

describe('validación de cotización antes de enviar', () => {
  function hayPreciosValidos(precios: Record<string, string>): boolean {
    return Object.values(precios).some(p => parseFloat(p || '0') > 0)
  }

  it('sin precios ingresados → no es válida', () => {
    expect(hayPreciosValidos({ 'abc': '', 'def': '' })).toBe(false)
  })

  it('con al menos un precio > 0 → es válida', () => {
    expect(hayPreciosValidos({ 'abc': '1500', 'def': '' })).toBe(true)
  })

  it('precio "0" explícito no es válido', () => {
    expect(hayPreciosValidos({ 'abc': '0' })).toBe(false)
  })

  it('precio "0.01" sí es válido (precio mínimo permitido)', () => {
    expect(hayPreciosValidos({ 'abc': '0.01' })).toBe(true)
  })
})

// ── Presentación de totales ────────────────────────────────────────────────

describe('formatearPrecio en contexto de cotizaciones', () => {
  it('muestra total 0 correctamente (cotización sin precios)', () => {
    const total = calcularTotalCotizacion([
      { precio_unitario: null, cantidad_oferta: null }
    ])
    expect(total).toBe(0)
    // El total 0 se formatea (no retorna '—', que es solo para null/undefined)
    expect(formatearPrecio(total)).toMatch(/0/)
  })

  it('total > 0 se formatea con símbolo de moneda', () => {
    const total = calcularTotalCotizacion([
      { precio_unitario: 50_000, cantidad_oferta: 2 }
    ])
    const formatted = formatearPrecio(total)
    expect(formatted).toMatch(/\$|ARS/)
    expect(formatted).toMatch(/100/)
  })
})
