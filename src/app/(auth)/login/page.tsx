import Link from 'next/link'
import FormularioLogin from './formulario-login'

export default function PaginaLogin() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="tarjeta">
        <h2 className="text-xl font-bold text-on-surface mb-6">Ingresá a tu cuenta</h2>
        <FormularioLogin />
      </div>
      <p className="mt-4 text-center text-sm text-on-surface-variant">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="font-semibold text-primary hover:text-primary-container transition-colors">
          Registrate acá
        </Link>
      </p>
    </div>
  )
}
