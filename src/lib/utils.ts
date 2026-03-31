import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Combinar clases de Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear fecha para mostrar en UI
export function formatearFecha(fecha: string): string {
  try {
    return format(parseISO(fecha), "d 'de' MMMM yyyy", { locale: es })
  } catch {
    return fecha
  }
}

// Formatear precio en pesos argentinos
export function formatearPrecio(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor)
}

// Calcular total de una cotización
export function calcularTotalCotizacion(
  lineas: Array<{ precio_unitario: number | null; cantidad_oferta: number | null }>
): number {
  return lineas.reduce((total, linea) => {
    if (linea.precio_unitario && linea.cantidad_oferta) {
      return total + linea.precio_unitario * linea.cantidad_oferta
    }
    return total
  }, 0)
}

// Días restantes hasta una fecha (negativo = vencido)
export function diasRestantes(fecha: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const objetivo = parseISO(fecha)
  objetivo.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

// Badge de estado del pedido
export function textoEstadoPedido(estado: string): string {
  const estados: Record<string, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    cerrado: 'Cerrado',
  }
  return estados[estado] ?? estado
}

export function colorEstadoPedido(estado: string): string {
  const colores: Record<string, string> = {
    borrador:  'bg-secondary-fixed text-on-secondary-fixed-variant',
    publicado: 'bg-primary-fixed text-primary',
    cerrado:   'bg-surface-container-high text-on-surface-variant',
  }
  return colores[estado] ?? 'bg-surface-container text-on-surface-variant'
}
