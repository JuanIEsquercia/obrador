import type { EstadoObra, EstadoPedido } from '@/types'

export const CONSTANTES_OBRA: Record<EstadoObra, { label: string; clase: string }> = {
  activa: { label: 'Activa', clase: 'bg-primary-fixed text-primary' },
  terminada: { label: 'Terminada', clase: 'bg-surface-container-high text-on-surface-variant' },
}

export const CONSTANTES_PEDIDO: Record<EstadoPedido, { label: string; clase: string }> = {
  borrador: { label: 'Borrador', clase: 'bg-surface-container-high text-on-surface-variant' },
  publicado: { label: 'Publicado', clase: 'bg-primary-fixed text-primary' },
  cerrado: { label: 'Cerrado', clase: 'bg-error-container text-on-error-container' },
}
