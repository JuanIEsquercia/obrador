import Link from 'next/link'

export function Footer() {
  return (
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
  )
}
