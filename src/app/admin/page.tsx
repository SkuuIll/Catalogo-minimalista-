import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductList } from '@/components/admin/ProductList'

export default async function AdminDashboard() {
  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="max-w-[1400px] mx-auto">
      <Suspense fallback={<div className="h-48 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />}>
        <ProductList initialCategories={categories} />
      </Suspense>
    </div>
  )
}