import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {/* Navegación */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-xl sm:text-2xl lg:text-[28px] font-medium tracking-tight text-primary">Aura</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant pt-1 sm:pt-2 hidden sm:inline">Minimalist</span>
            </Link>
            <div className="flex items-center space-x-4 sm:space-x-8 lg:space-x-12">
              <Link href="/admin" className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">
                Admin
              </Link>
              <Link href="/login" className="px-4 sm:px-6 py-2 border border-primary/20 rounded-full text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all">
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        {/* Hero */}
        <header className="mb-16 sm:mb-20 lg:mb-24 max-w-2xl animate-fade-in-up">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-medium text-on-surface mb-4 sm:mb-6">
            Curaduría de Objetos <span className="text-primary italic">Esenciales</span>
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant font-light leading-relaxed">
            Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno.
            La simplicidad es la máxima sofisticación.
          </p>
        </header>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-x-8 lg:gap-x-12 gap-y-12 sm:gap-y-16 lg:gap-y-20">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-on-surface-variant font-serif italic text-lg sm:text-xl">La colección está vacía actualmente.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className="group flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-[4/5] bg-surface overflow-hidden rounded-lg mb-5 sm:mb-6 lg:mb-8">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container">
                      <span className="font-serif italic text-on-surface-variant">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1 bg-background/80 backdrop-blur-sm border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">${product.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-serif text-lg sm:text-xl lg:text-[22px] font-medium text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-sm sm:text-[12px] font-medium text-primary whitespace-nowrap mt-1">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-light mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
                      {product.category || 'Estilo de Vida'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-16 lg:py-20 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0">
          <div>
            <span className="font-serif text-xl sm:text-2xl font-medium text-primary">Aura</span>
          </div>
          <div className="text-[11px] sm:text-[12px] text-on-surface-variant/50 font-light tracking-widest uppercase text-center sm:text-right">
            © 2026 Aura Collective. Catálogo Minimalista.
          </div>
        </div>
      </footer>
    </div>
  )
}
