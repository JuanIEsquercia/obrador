import {
  formatearFecha,
  formatearPrecio,
  calcularTotalCotizacion,
  textoEstadoPedido,
  colorEstadoPedido,
} from '@/lib/utils'

describe('formatearFecha', () => {
  it('formatea una fecha ISO válida en español', () => {
    expect(formatearFecha('2024-03-15')).toBe('15 de marzo 2024')
  })

  it('retorna el string original si la fecha es inválida', () => {
    expect(formatearFecha('no-es-una-fecha')).toBe('no-es-una-fecha')
  })

  it('maneja fechas con hora incluida en mediodía UTC', () => {
    // Usar mediodía UTC para evitar ambigüedad de zona horaria
    expect(formatearFecha('2024-01-15T12:00:00.000Z')).toMatch(/15 de enero 2024/)
  })
})

describe('formatearPrecio', () => {
  it('retorna guión para null', () => {
    expect(formatearPrecio(null)).toBe('—')
  })

  it('retorna guión para undefined', () => {
    expect(formatearPrecio(undefined)).toBe('—')
  })

  it('formatea cero correctamente', () => {
    expect(formatearPrecio(0)).toMatch(/0/)
  })

  it('formatea un número entero en pesos argentinos', () => {
    const result = formatearPrecio(1500)
    expect(result).toMatch(/1\.500|1,500|1500/)
    expect(result).toMatch(/\$|ARS/)
  })

  it('formatea decimales correctamente', () => {
    const result = formatearPrecio(1500.5)
    expect(result).toMatch(/50/)
  })
})

describe('calcularTotalCotizacion', () => {
  it('retorna 0 para un array vacío', () => {
    expect(calcularTotalCotizacion([])).toBe(0)
  })

  it('retorna 0 cuando todos los precios son null', () => {
    expect(calcularTotalCotizacion([
      { precio_unitario: null, cantidad_oferta: null },
      { precio_unitario: null, cantidad_oferta: 5 },
    ])).toBe(0)
  })

  it('calcula correctamente el total de líneas válidas', () => {
    expect(calcularTotalCotizacion([
      { precio_unitario: 100, cantidad_oferta: 3 },
      { precio_unitario: 50, cantidad_oferta: 2 },
    ])).toBe(400)
  })

  it('ignora líneas con precio o cantidad null', () => {
    expect(calcularTotalCotizacion([
      { precio_unitario: 100, cantidad_oferta: 3 },
      { precio_unitario: null, cantidad_oferta: 5 },
      { precio_unitario: 200, cantidad_oferta: null },
    ])).toBe(300)
  })
})

describe('textoEstadoPedido', () => {
  it('retorna texto correcto para borrador', () => {
    expect(textoEstadoPedido('borrador')).toBe('Borrador')
  })

  it('retorna texto correcto para publicado', () => {
    expect(textoEstadoPedido('publicado')).toBe('Publicado')
  })

  it('retorna texto correcto para cerrado', () => {
    expect(textoEstadoPedido('cerrado')).toBe('Cerrado')
  })

  it('retorna el valor original para estados desconocidos', () => {
    expect(textoEstadoPedido('desconocido')).toBe('desconocido')
  })
})

describe('colorEstadoPedido', () => {
  it('retorna clases CSS para borrador', () => {
    const result = colorEstadoPedido('borrador')
    expect(result).toContain('bg-')
    expect(result).toContain('text-')
  })

  it('retorna un color de fallback para estados desconocidos', () => {
    const result = colorEstadoPedido('desconocido')
    expect(result).toContain('bg-surface-container')
  })

  it('retorna diferentes clases para diferentes estados', () => {
    expect(colorEstadoPedido('borrador')).not.toBe(colorEstadoPedido('publicado'))
    expect(colorEstadoPedido('publicado')).not.toBe(colorEstadoPedido('cerrado'))
  })
})
