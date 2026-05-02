const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.siteSettings.updateMany({
    data: {
      siteName: 'SHOWROOM JR',
      siteTagline: 'Catálogo Premium',
      heroTitle: 'Todo lo que buscás.',
      heroSubtitle: 'Tecnología, moda y accesorios — en un solo lugar.'
    }
  })
  console.log('Database updated!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
