import Link from 'next/link'

export function Beneficios() {
  return (
    <section id="beneficios" className="py-28 bg-surface-container">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Para todos</p>
          <h2 className="text-4xl font-black text-primary tracking-tight">¿Quién gana con Obrador?</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-10 rounded-3xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.08)] space-y-6">
            <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">person_outline</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Para vos que construís</p>
              <h3 className="text-2xl font-black text-primary">Compradores</h3>
            </div>
            <ul className="space-y-5">
              {[
                {t:'Ahorro de Dinero', d:'Accedé a precios mayoristas y competitivos. Los proveedores compiten por ganarte.'},
                {t:'Chau a las llamadas', d:'No más llamar a 10 corralones distintos. Un pedido, múltiples cotizaciones automáticas.'},
                {t:'Transparencia total', d:'Comparativa ítem por ítem. Todo el historial de tus pedidos en un solo lugar.'},
              ].map(i=>(
                <li key={i.t} className="flex items-start gap-4">
                  <span className="material-symbols-outlined icon-fill text-secondary mt-0.5 flex-shrink-0">verified</span>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{i.t}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{i.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/registro?rol=comprador" className="btn-primario w-full justify-center h-12 text-sm">
              Empezar como comprador
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
            </Link>
          </div>
          <div className="bg-primary p-10 rounded-3xl shadow-xl space-y-6 text-on-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/5 rounded-full -mr-20 -mt-20" />
            <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-on-primary/60 uppercase tracking-widest mb-1">Para vos que vendés</p>
              <h3 className="text-2xl font-black">Proveedores</h3>
            </div>
            <ul className="space-y-5 relative z-10">
              {[
                {t:'Nuevos Clientes', d:'Llegá a obras que antes no conocías, sin esfuerzo comercial ni visitas.'},
                {t:'Cierre de Ventas Ágil', d:'Cotizá rápido desde tu celular y ganás el pedido en tiempo real.'},
                {t:'Panel Centralizado', d:'Todos tus pedidos, cotizaciones y clientes en un panel limpio y fácil.'},
              ].map(i=>(
                <li key={i.t} className="flex items-start gap-4">
                  <span className="material-symbols-outlined icon-fill text-secondary-container mt-0.5 flex-shrink-0">verified</span>
                  <div>
                    <p className="font-bold text-sm">{i.t}</p>
                    <p className="text-on-primary/70 text-sm leading-relaxed">{i.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="relative z-10">
              <Link href="/registro?rol=vendedor" className="h-12 px-6 bg-secondary-container text-on-secondary-fixed-variant font-bold text-sm rounded-xl inline-flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 w-full justify-center">
                Registrar mi corralón
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
