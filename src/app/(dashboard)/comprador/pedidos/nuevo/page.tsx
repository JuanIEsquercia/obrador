import { redirect } from 'next/navigation'

// La creación de licitaciones ahora se hace desde una obra.
// Redirigir a la lista de obras para que el comprador elija desde dónde crear.
export default function PaginaNuevoPedidoLegacy() {
  redirect('/comprador/obras')
}
