import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { DeleteProductButton } from './DeleteProductButton'

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <nav className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-16">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="font-serif text-[24px] font-medium text-primary">Command Center</h1>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
                View Store
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-16 px-5 sm:px-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-[32px] font-medium leading-[1.2] text-on-surface">Artifacts Registry</h2>
            <p className="mt-2 text-[16px] text-on-surface-variant">Managing {products.length} active entries.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-block bg-gradient-to-r from-primary-container to-[#8E6E37] text-on-primary px-6 py-3 rounded text-[14px] font-semibold tracking-[0.05em] hover:-translate-y-0.5 transition-transform"
          >
            + New Artifact
          </Link>
        </div>

        <div className="glass rounded-lg border border-white/5 overflow-hidden">
          <ul className="divide-y divide-white/5">
            {products.length === 0 ? (
              <li className="p-12 text-center text-on-surface-variant">No artifacts in the registry.</li>
            ) : (
              products.map((product) => (
                <li key={product.id} className="hover:bg-surface-bright/20 transition-colors">
                  <div className="px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-surface-container rounded border border-white/5 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-surface-container" />
                        )}
                      </div>
                      <div className="ml-6">
                        <div className="font-serif text-[18px] text-on-surface mb-1">{product.name}</div>
                        <div className="text-[14px] text-on-surface-variant font-sans">
                          {product.category || 'Uncategorized'} <span className="mx-2 opacity-50">•</span> <span className="text-primary">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                       <DeleteProductButton id={product.id} />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}
