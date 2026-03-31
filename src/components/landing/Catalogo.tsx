import Link from 'next/link'

export function Catalogo() {
  return (
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
  )
}
