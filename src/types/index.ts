// ============================================================
// Tipos centrales de Obrador
// ============================================================

export type RolUsuario = 'comprador' | 'vendedor'
export type EstadoPedido = 'borrador' | 'publicado' | 'cerrado'

export interface Perfil {
  id: string
  nombre: string
  empresa: string
  cuit: string
  telefono: string | null
  rol: RolUsuario
  creado_en: string
  actualizado_en: string
}

export interface FamiliaProducto {
  id: number
  nombre: string
}

export interface VendedorFamilia {
  vendedor_id: string
  familia_id: number
}

export interface Pedido {
  id: string
  comprador_id: string
  titulo: string
  descripcion: string | null
  direccion_entrega: string
  fecha_entrega: string   // ISO date "YYYY-MM-DD"
  estado: EstadoPedido
  publicado_en: string | null
  creado_en: string
  actualizado_en: string
}

export interface LineaPedido {
  id: string
  pedido_id: string
  familia_id: number
  descripcion: string
  cantidad: number
  unidad: string
  notas: string | null
  orden: number
  creado_en: string
  // join
  familia?: FamiliaProducto
}

export interface Cotizacion {
  id: string
  pedido_id: string
  vendedor_id: string
  tiene_financiacion: boolean
  descuento_pago_contado: boolean
  entrega_inmediata: boolean
  acepta_division: boolean   // si false: solo vende el paquete completo
  notas_pago: string | null
  ganadora: boolean | null
  creado_en: string
  actualizado_en: string
  // joins opcionales
  vendedor?: Perfil
  lineas?: LineaCotizacion[]
}

export interface LineaCotizacion {
  id: string
  cotizacion_id: string
  linea_pedido_id: string
  precio_unitario: number | null
  cantidad_oferta: number | null
  notas: string | null
  creado_en: string
  // join
  linea_pedido?: LineaPedido
}

// ---- Tipos para formularios ----

export interface FormRegistro {
  email: string
  password: string
  nombre: string
  empresa: string
  cuit: string
  telefono: string
  rol: RolUsuario
}

export interface FormPedido {
  titulo: string
  descripcion: string
  direccion_entrega: string
  fecha_entrega: string
}

export interface ItemLineaPedido {
  familia_id: number
  descripcion: string
  cantidad: number
  unidad: string
  notas: string
}

export interface FormLineaCotizacion {
  linea_pedido_id: string
  precio_unitario: string   // string para el input, se parsea al enviar
  cantidad_oferta: string
  notas: string
}

export interface FormCotizacion {
  tiene_financiacion: boolean
  descuento_pago_contado: boolean
  entrega_inmediata: boolean
  acepta_division: boolean
  notas_pago: string
  lineas: FormLineaCotizacion[]
}

// ---- Tipo compuesto para vista comparativa ----

export interface PedidoConLineas extends Pedido {
  lineas: LineaPedido[]
  cotizaciones?: CotizacionConLineas[]
}

export interface CotizacionConLineas extends Cotizacion {
  lineas: LineaCotizacion[]
  vendedor: Perfil
}
