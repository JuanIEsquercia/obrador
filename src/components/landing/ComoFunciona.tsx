export function ComoFunciona() {
  return (
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
  )
}
