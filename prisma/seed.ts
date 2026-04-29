import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@catalogo.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Catalogo2026!Seguro'
  const password = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password },
    create: {
      email: adminEmail,
      name: 'Administrador',
      password,
    },
  })

  console.log('Usuario admin creado/actualizado:', admin.email)

  // Limpiar productos existentes para evitar duplicados en re-seed
  await prisma.product.deleteMany()

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Pro',
        description: 'Último modelo con cámara profesional de 108MP, batería de 5000mAh y pantalla OLED de 120Hz.',
        price: 999.99,
        category: 'Electrónica',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Auriculares Inalámbricos',
        description: 'Cancelación activa de ruido, sonido Hi-Res Audio y 30 horas de autonomía.',
        price: 249.50,
        category: 'Audio',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Reloj Minimalista',
        description: 'Diseño elegante con correa de cuero genuino y caja de acero inoxidable cepillado.',
        price: 120.00,
        category: 'Accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Ultraligera',
        description: 'Procesador de última generación, 16GB RAM y SSD de 512GB en un cuerpo de 1.2kg.',
        price: 1299.00,
        category: 'Electrónica',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Cámara Instantánea',
        description: 'Captura momentos únicos con estilo retro. Incluye 10 películas de regalo.',
        price: 89.99,
        category: 'Fotografía',
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=500&auto=format&fit=crop'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Zapatillas Deportivas',
        description: 'Tecnología de amortiguación avanzada, transpirables y diseño urbano moderno.',
        price: 159.00,
        category: 'Calzado',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop'
      }
    })
  ])

  console.log('Productos creados:', products.length)
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
