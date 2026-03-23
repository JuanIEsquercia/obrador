import Link from 'next/link'

// Layout para páginas de autenticación (login, registro, onboarding)
export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <Link href="/" className="text-4xl font-black text-primary tracking-tighter">
            Obrador
          </Link>
          <p className="mt-1 text-sm text-on-surface-variant">
            Materiales de construcción, sin vueltas
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}
