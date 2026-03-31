import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    template: '%s | Obrador',
    default: 'Obrador — Marketplace B2B de Construcción',
  },
  description: 'Publicá tu lista de materiales, recibí cotizaciones de los mejores proveedores de Corrientes y elegí el mejor precio. Sin llamadas, sin vueltas.',
  openGraph: {
    title: 'Obrador — Marketplace B2B de Construcción',
    description: 'El primer marketplace de materiales de construcción en Corrientes. Ahorrá tiempo y dinero en tu obra.',
    url: 'https://obrador.com.ar',
    siteName: 'Obrador',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={inter.variable}>
      <head>
        {/* Material Symbols Outlined — íconos de Google */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
