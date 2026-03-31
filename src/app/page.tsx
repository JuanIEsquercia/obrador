import Link from 'next/link'
import { Suspense } from 'react'
import { NavAuth, NavAuthFallback } from '@/app/components/nav-auth'
import type { Metadata } from 'next'

// Nuevos componentes de la landing componentizada
import { Hero } from '@/components/landing/Hero'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { Beneficios } from '@/components/landing/Beneficios'
import { Catalogo } from '@/components/landing/Catalogo'
import { CtaFinal } from '@/components/landing/CtaFinal'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Cotizá materiales para tu obra',
  description: 'Publicá tu lista, recibí presupuestos y ahorrá tiempo real en tu obra con los mejores proveedores de Corrientes.',
}

export default function PaginaInicio() {
  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* NAV (Mantenido inline o en app/componentes si lo desean) */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_12px_rgba(25,28,29,0.06)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary">Obrador</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Cómo funciona</a>
            <a href="#beneficios" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Beneficios</a>
            <a href="#categorias" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Materiales</a>
          </div>
          <div className="flex items-center gap-3">
            <Suspense fallback={<NavAuthFallback />}>
              <NavAuth />
            </Suspense>
          </div>
        </div>
      </nav>

      <Hero />
      <ComoFunciona />
      <Beneficios />
      <Catalogo />
      <CtaFinal />
      <Footer />
    </div>
  )
}
