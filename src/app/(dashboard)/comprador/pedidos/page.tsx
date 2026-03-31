import { redirect } from 'next/navigation'

// Las licitaciones ahora viven dentro de obras.
// Redirigir a la lista de obras.
export default function PaginaMisPedidosLegacy() {
  redirect('/comprador/obras')
}
