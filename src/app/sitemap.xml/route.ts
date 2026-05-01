import { prisma } from '@/lib/prisma'

const siteUrl = process.env.SITE_URL || 'https://showjr.store'

export async function GET() {
  try {
    // Fetch all products and categories
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, updatedAt: true },
        where: { status: 'AVAILABLE' },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        where: { active: true },
      }),
    ])

    // Build sitemap entries
    const staticPages: { path: string; priority: number; changefreq: string; lastmod?: string }[] = [
      { path: '', priority: 1.0, changefreq: 'daily' },
      { path: 'explore', priority: 0.8, changefreq: 'daily' },
      { path: 'search', priority: 0.7, changefreq: 'weekly' },
      { path: 'login', priority: 0.3, changefreq: 'monthly' },
    ]

    const productPages = products.map((p) => ({
      path: `product/${p.id}`,
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: p.updatedAt.toISOString(),
    }))

    const categoryPages = categories.map((c) => ({
      path: `explore?category=${c.slug}`,
      priority: 0.7,
      changefreq: 'weekly',
      lastmod: c.updatedAt.toISOString(),
    }))

    const allPages = [...staticPages, ...productPages, ...categoryPages]

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}/${page.path}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap error:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
}
