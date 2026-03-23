import Link from 'next/link'
import { crearClienteServidor } from '@/lib/supabase/servidor'

export default async function PaginaInicio() {
  const supabase = await crearClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_12px_rgba(25,28,29,0.06)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary">Obrador</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Cómo funciona</a>
            <a href="#beneficios" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Beneficios</a>
            <a href="#categorias" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">Materiales</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="h-10 px-5 bg-primary text-on-primary font-bold text-sm rounded-xl active:scale-95 transition-transform flex items-center">
                Ir al panel
              </Link>
            ) : (
              <>
                <Link href="/login" className="h-10 px-4 text-primary font-semibold text-sm rounded-xl hover:bg-primary-fixed/40 transition-colors flex items-center">
                  Ingresar
                </Link>
                <Link href="/registro" className="h-10 px-5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
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

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Simple, rápido, sin vueltas</p>
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">¡Che, fijate cómo funciona!</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-16 text-sm leading-relaxed">
            Tres pasos y tu pedido está cotizado. Sin llamadas, sin visitas, sin perder tiempo.
          </p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+3.5rem)] right-[calc(16.67%+3.5rem)] h-0.5 bg-gradient-to-r from-primary-fixed via-secondary-fixed to-tertiary-fixed" />
            {[
              {icono:'assignment_add', bg:'bg-primary-fixed', cor:'text-primary', num:'01', titulo:'Publicá tu necesidad', desc:'Cargá la lista de materiales que necesitás para tu obra. Por familia de producto, con cantidades y fecha de entrega.'},
              {icono:'request_quote', bg:'bg-secondary-fixed', cor:'text-secondary', num:'02', titulo:'Recibí cotizaciones', desc:'Los mejores corralones de Corrientes compiten ofreciéndote sus mejores precios, ítem por ítem.'},
              {icono:'shopping_cart_checkout', bg:'bg-tertiary-fixed', cor:'text-tertiary', num:'03', titulo:'Elegí y comprá', desc:'Compará ofertas en una tabla clara, elegí al ganador y coordiná la entrega directamente.'},
            ].map(p=>(
              <div key={p.num} className="group relative">
                <div className={`w-28 h-28 ${p.bg} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <span className={`material-symbols-outlined text-5xl ${p.cor}`}>{p.icono}</span>
                </div>
                <p className="text-xs font-black text-outline uppercase tracking-widest mb-2">{p.num}</p>
                <h3 className="text-xl font-black text-primary mb-3">{p.titulo}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm max-w-xs mx-auto">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
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

      {/* CATÁLOGO */}
      <section id="categorias" className="py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Catálogo</p>
              <h2 className="text-4xl font-black text-primary tracking-tight">Todo lo que tu obra necesita</h2>
              <p className="text-on-surface-variant mt-2 text-sm">Explorá las familias de productos más buscadas en Corrientes.</p>
            </div>
            <Link href="/registro" className="text-primary font-bold hover:text-primary-container transition-colors flex items-center gap-1.5 text-sm flex-shrink-0">
              Ver catálogo completo
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {icono:'deployed_code', nombre:'Ladrillos'},
              {icono:'grid_on', nombre:'Hierros'},
              {icono:'layers', nombre:'Cemento'},
              {icono:'format_paint', nombre:'Pinturas'},
              {icono:'plumbing', nombre:'Sanitarios'},
              {icono:'electric_bolt', nombre:'Eléctrico'},
              {icono:'nature', nombre:'Madera'},
              {icono:'landscape', nombre:'Piedra'},
              {icono:'water_drop', nombre:'Arena'},
              {icono:'inventory_2', nombre:'Otros'},
            ].map(cat=>(
              <div key={cat.nombre} className="group bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-[0_12px_32px_-4px_rgba(25,28,29,0.10)] transition-all duration-300 p-6 rounded-2xl text-center cursor-default">
                <span className="material-symbols-outlined text-4xl text-primary mb-3 block group-hover:scale-110 transition-transform duration-300">{cat.icono}</span>
                <p className="font-bold text-primary text-sm">{cat.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary-container/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-fixed/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-on-primary/80 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-secondary-container rounded-full animate-pulse" />
              Corrientes, Argentina
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-on-primary tracking-tight">¿Listo para empezar a cotizar?</h2>
            <p className="text-on-primary/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Sumate a la red de constructores y corralones más grande de la provincia. Tu pedido está en camino.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5 pt-2">
              <Link href="/registro?rol=comprador" className="h-16 px-12 bg-surface-container-lowest text-primary font-black text-base rounded-xl hover:bg-surface transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">construction</span>
                Registrar mi Obra
              </Link>
              <Link href="/registro?rol=vendedor" className="h-16 px-12 bg-secondary-container text-on-secondary-fixed-variant font-black text-base rounded-xl hover:opacity-90 transition-opacity shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">store</span>
                Unirme como Corralón
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-container-low border-t border-outline-variant/30 py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="font-black text-primary text-2xl tracking-tighter">Obrador</Link>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">
              El primer marketplace B2B diseñado específicamente para el mercado constructor correntino.
            </p>
          </div>
          {[
            {titulo:'Plataforma', links:[{l:'Cómo funciona',h:'#como-funciona'},{l:'Para Compradores',h:'/registro?rol=comprador'},{l:'Para Proveedores',h:'/registro?rol=vendedor'}]},
            {titulo:'Soporte', links:[{l:'Contacto',h:'#'},{l:'Preguntas Frecuentes',h:'#'},{l:'Ayuda en Obra',h:'#'}]},
            {titulo:'Legal', links:[{l:'Términos de Servicio',h:'#'},{l:'Privacidad',h:'#'}]},
          ].map(col=>(
            <div key={col.titulo}>
              <h4 className="text-primary font-bold mb-4 uppercase text-xs tracking-widest">{col.titulo}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link=>(
                  <li key={link.l}>
                    <a href={link.h} className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">{link.l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/30 text-center">
          <p className="text-xs text-on-surface-variant">© 2024 Obrador Marketplace — Corrientes, Argentina</p>
        </div>
      </footer>

    </div>
  )
}
