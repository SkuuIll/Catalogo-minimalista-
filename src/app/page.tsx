import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-16">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-[28px] font-medium tracking-tight text-primary">Aura</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant pt-2">Minimalist</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-12">
              <Link href="/admin" className="text-[12px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">
                Admin
              </Link>
              <Link href="/login" className="px-6 py-2 border border-primary/20 rounded-full text-[12px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-16 py-20">
        {/* Hero Section */}
        <header className="mb-24 max-w-2xl">
          <h1 className="font-serif text-[56px] leading-[1.1] font-medium text-on-surface mb-6">
            Curation of <span className="text-primary italic">Essential</span> Objects
          </h1>
          <p className="text-[18px] text-on-surface-variant font-light leading-relaxed">
            A minimalist catalog featuring high-quality items designed for the modern lifestyle. 
            Simplicity is the ultimate sophistication.
          </p>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-on-surface-variant font-serif italic text-[20px]">The collection is currently empty.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] bg-surface overflow-hidden rounded-sm mb-8">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container">
                      <span className="font-serif italic text-on-surface-variant">No visual</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">${product.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-[22px] font-medium text-on-surface group-hover:text-primary transition-colors">{product.name}</h3>
                    <span className="text-[12px] font-medium text-primary">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[14px] text-on-surface-variant font-light mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">{product.category || 'Lifestyle'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-16 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-8 sm:mb-0">
            <span className="font-serif text-[24px] font-medium text-primary">Aura</span>
          </div>
          <div className="text-[12px] text-on-surface-variant/50 font-light tracking-widest uppercase">
            © 2026 Aura Collective. Minimalist Artifacts.
          </div>
        </div>
      </footer>
    </div>
  )
}
