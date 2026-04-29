import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@catalog.com' },
    update: {},
    create: {
      email: 'admin@catalog.com',
      name: 'Admin User',
      password,
    },
  })

  console.log({ admin })

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Pro',
        description: 'Latest model with amazing camera',
        price: 999.99,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'Noise cancelling over-ear headphones',
        price: 249.50,
        category: 'Audio',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Minimalist Watch',
        description: 'Elegant design for everyday use',
        price: 120.00,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop'
      }
    })
  ])

  console.log('Created products:', products.length)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
