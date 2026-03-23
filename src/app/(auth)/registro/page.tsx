import Link from 'next/link'
import FormularioRegistro from './formulario-registro'
import type { RolUsuario } from '@/types'

export default function PaginaRegistro({
  searchParams,
}: {
  searchParams: { rol?: string }
}) {
  const rolInicial = searchParams.rol === 'comprador' || searchParams.rol === 'vendedor'
    ? searchParams.rol as RolUsuario
    : undefined

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="tarjeta">
        <h2 className="text-xl font-bold text-on-surface mb-1">Crear cuenta</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Elegí si sos comprador de materiales o proveedor.
        </p>
        <FormularioRegistro rolInicial={rolInicial} />
      </div>
      <p className="mt-4 text-center text-sm text-on-surface-variant">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-container transition-colors">
          Ingresá acá
        </Link>
      </p>
    </div>
  )
}
