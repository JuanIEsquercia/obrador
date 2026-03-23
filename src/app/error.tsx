'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-error-container rounded-3xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-error">warning</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary mb-2">Algo salió mal</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 bg-primary text-on-primary font-bold text-sm rounded-xl active:scale-95 transition-transform"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="h-11 px-6 bg-surface-container text-on-surface font-semibold text-sm rounded-xl active:scale-95 transition-transform flex items-center justify-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
