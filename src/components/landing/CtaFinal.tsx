import Link from 'next/link'

export function CtaFinal() {
  return (
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
  )
}
