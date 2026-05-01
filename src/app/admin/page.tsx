import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductList } from '@/components/admin/ProductList'
import { TableRowSkeleton } from '@/components/Skeleton'

export default async function AdminDashboard() {
  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="max-w-[1400px] mx-auto">
      <Suspense fallback={
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
        </div>
      }>
        <ProductList initialCategories={categories} />
      </Suspense>
    </div>
  )
}
