'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { crearClienteNavegador } from '@/lib/supabase/cliente'
import type { RolUsuario } from '@/types'

interface Props {
  nombre: string
  empresa: string
  rol: RolUsuario
}

type NavLink = {
  href: string
  icono: string
  label: string
  exacto?: boolean
}

const LINKS_COMPRADOR: NavLink[] = [
  { href: '/comprador',             icono: 'dashboard',   label: 'Panel de Control', exacto: true },
  { href: '/comprador/obras',       icono: 'domain',      label: 'Mis Obras' },
  { href: '/comprador/obras/nueva', icono: 'add_circle',  label: 'Nueva Obra', exacto: true },
]

const LINKS_VENDEDOR: NavLink[] = [
  { href: '/vendedor/pedidos',       icono: 'shopping_bag',   label: 'Pedidos disponibles' },
  { href: '/vendedor/cotizaciones',  icono: 'gavel',          label: 'Mis cotizaciones' },
]

export default function NavegacionPrincipal({ nombre, empresa, rol }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [supabase] = useState(() => crearClienteNavegador())

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const esComprador = rol === 'comprador'
  const links = esComprador ? LINKS_COMPRADOR : LINKS_VENDEDOR
  const iniciales = nombre.charAt(0).toUpperCase()

  function esActivo(link: NavLink) {
    return link.exacto ? pathname === link.href : pathname.startsWith(link.href)
  }

  return (
    <>
      {/* ── Sidebar Desktop ──────────────────────────────── */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface-container-lowest hidden md:flex flex-col p-4 z-50">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary flex-shrink-0">
            <span className="material-symbols-outlined icon-fill">architecture</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none">Obrador</h1>
            <p className="text-xs text-on-surface-variant font-medium">Marketplace B2B</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1">
          {links.map(link => {
            const activo = esActivo(link)
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                  activo
                    ? 'bg-primary-fixed text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{link.icono}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Usuario + logout */}
        <div className="pt-4 border-t border-outline-variant/20 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">
              {iniciales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface leading-tight truncate">{nombre}</p>
              <p className="text-xs text-on-surface-variant leading-tight truncate">{empresa}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 text-on-surface-variant px-4 py-2.5 hover:bg-surface-container-low rounded-xl text-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Header (sticky, respeta sidebar en desktop) ──── */}
      <header className="md:ml-64 sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="flex justify-between items-center h-16 px-6">
          {/* Mobile: logo */}
          <Link href="/dashboard" className="md:hidden text-2xl font-black text-primary tracking-tight">
            Obrador
          </Link>
          <div className="hidden md:block" />

          {/* Usuario */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary leading-none">{nombre}</p>
              <p className="text-xs text-on-surface-variant font-medium">{empresa}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm border-2 border-primary-fixed flex-shrink-0">
              {iniciales}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest/90 backdrop-blur-md flex justify-around items-center h-16 px-2 z-50 border-t border-outline-variant/10">
        {links.slice(0, 2).map(link => {
          const activo = esActivo(link)
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 ${activo ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined">{link.icono}</span>
              <span className="text-[10px] font-bold">{link.label.split(' ')[0]}</span>
            </Link>
          )
        })}

        {/* FAB central */}
        <div className="relative -top-5">
          <Link
            href={esComprador ? '/comprador/obras/nueva' : '/vendedor/pedidos'}
            className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-surface"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </div>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 ${pathname === '/dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>

        <button
          onClick={cerrarSesion}
          className="flex flex-col items-center justify-center gap-0.5 px-3 text-on-surface-variant"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] font-bold">Salir</span>
        </button>
      </nav>
    </>
  )
}
