import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-surface-container-low pt-20 px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary-fixed/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-secondary-fixed/25 rounded-full blur-[60px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center py-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined" style={{fontSize:'14px'}}>location_on</span>
            Líder en Corrientes
          </div>
          <h1 className="text-5xl md:text-[4.5rem] font-black text-primary leading-[1.05] tracking-tight">
            Cotizar materiales nunca fue tan fácil.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
            En Obrador, los proveedores compiten por darte el mejor precio. Publicá tu lista, recibí presupuestos y ahorrá tiempo real en tu obra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link href="/registro?rol=comprador" className="h-16 px-10 bg-primary text-on-primary font-bold text-lg rounded-xl shadow-lg hover:bg-primary-container hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
              Soy Comprador
              <span className="material-symbols-outlined">construction</span>
            </Link>
            <Link href="/registro?rol=vendedor" className="h-16 px-10 bg-secondary-container text-on-secondary-fixed-variant font-bold text-lg rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3">
              Soy Vendedor
              <span className="material-symbols-outlined">storefront</span>
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">+200</p>
              <p className="text-xs text-on-surface-variant font-medium">Proveedores activos</p>
            </div>
            <div className="w-px h-10 bg-outline-variant/40" />
            <div className="text-center">
              <p className="text-2xl font-black text-primary">+1.500</p>
              <p className="text-xs text-on-surface-variant font-medium">Pedidos cotizados</p>
            </div>
            <div className="w-px h-10 bg-outline-variant/40" />
            <div className="text-center">
              <p className="text-2xl font-black text-primary">30%</p>
              <p className="text-xs text-on-surface-variant font-medium">Ahorro promedio</p>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative bg-surface-container-lowest rounded-3xl p-4 shadow-2xl border border-white/60">
            <div className="rounded-2xl w-full h-[480px] bg-gradient-to-br from-primary to-primary-container flex items-end overflow-hidden relative">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />
              <div className="relative z-10 p-8 text-on-primary space-y-3 w-full">
                <p className="text-xs font-bold uppercase tracking-widest text-on-primary/60">Pedido activo</p>
                <p className="text-2xl font-black">Materiales planta baja — Av. Cazadores</p>
                <div className="flex gap-2 flex-wrap">
                  {['Ladrillos','Cemento','Hierros'].map(f=>(
                    <span key={f} className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">{f}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                  <span className="text-sm font-bold text-secondary-container">4 cotizaciones recibidas</span>
                </div>
              </div>
            </div>
            <div className="absolute top-8 -left-12 bg-surface-container-lowest p-4 rounded-2xl shadow-xl border border-outline-variant/20 flex items-center gap-3 max-w-[220px]">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary flex-shrink-0">
                <span className="material-symbols-outlined icon-fill" style={{fontSize:'20px'}}>check_circle</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Estado</p>
                <p className="text-xs font-black text-primary leading-tight">Cotización Recibida</p>
                <p className="text-[10px] text-on-surface-variant">5.000 Ladrillos</p>
              </div>
            </div>
            <div className="absolute bottom-8 -right-10 bg-surface-container-lowest p-4 rounded-2xl shadow-xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Mejor precio</p>
              <p className="text-xl font-black text-primary">$2.847.500</p>
              <p className="text-[10px] text-secondary font-semibold">↓ 22% vs mercado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
