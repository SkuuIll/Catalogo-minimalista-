import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@catalogo.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Catalogo2026!Seguro'
  const password = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password },
    create: {
      email: adminEmail,
      name: 'Administrador',
      password,
    },
  })
  console.log('✅ Usuario admin:', adminEmail)

  // Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Aura',
      siteTagline: 'Minimalist',
      heroTitle: 'Curaduría de Objetos Esenciales',
      heroSubtitle: 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno. La simplicidad es la máxima sofisticación.',
      primaryColor: '#d4a853',
      showCategories: true,
    },
  })
  console.log('✅ SiteSettings creado')

  // Limpiar para evitar duplicados
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Categorías
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Tecnología', slug: 'tecnologia', icon: '💻', order: 0 } }),
    prisma.category.create({ data: { name: 'Audio', slug: 'audio', icon: '🎧', order: 1 } }),
    prisma.category.create({ data: { name: 'Accesorios', slug: 'accesorios', icon: '⌚', order: 2 } }),
    prisma.category.create({ data: { name: 'Fotografía', slug: 'fotografia', icon: '📷', order: 3 } }),
    prisma.category.create({ data: { name: 'Calzado', slug: 'calzado', icon: '👟', order: 4 } }),
    prisma.category.create({ data: { name: 'Ropa', slug: 'ropa', icon: '👕', order: 5 } }),
  ])
  console.log('✅ Categorías creadas:', categories.length)

  const catMap = new Map(categories.map(c => [c.slug, c.id]))

  // Productos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Pro',
        description: 'Último modelo con cámara profesional de 108MP, batería de 5000mAh y pantalla OLED de 120Hz.',
        price: 999.99,
        categoryId: catMap.get('tecnologia')!,
        categoryName: 'Tecnología',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Auriculares Inalámbricos',
        description: 'Cancelación activa de ruido, sonido Hi-Res Audio y 30 horas de autonomía.',
        price: 249.50,
        categoryId: catMap.get('audio')!,
        categoryName: 'Audio',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Reloj Minimalista',
        description: 'Diseño elegante con correa de cuero genuino y caja de acero inoxidable cepillado.',
        price: 120.00,
        categoryId: catMap.get('accesorios')!,
        categoryName: 'Accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Ultraligera',
        description: 'Procesador de última generación, 16GB RAM y SSD de 512GB en un cuerpo de 1.2kg.',
        price: 1299.00,
        categoryId: catMap.get('tecnologia')!,
        categoryName: 'Tecnología',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Cámara Instantánea',
        description: 'Captura momentos únicos con estilo retro. Incluye 10 películas de regalo.',
        price: 89.99,
        categoryId: catMap.get('fotografia')!,
        categoryName: 'Fotografía',
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Zapatillas Deportivas',
        description: 'Tecnología de amortiguación avanzada, transpirables y diseño urbano moderno.',
        price: 159.00,
        categoryId: catMap.get('calzado')!,
        categoryName: 'Calzado',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Camiseta Premium',
        description: 'Algodón orgánico 100%, corte slim fit y acabados de alta calidad.',
        price: 45.00,
        categoryId: catMap.get('ropa')!,
        categoryName: 'Ropa',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop',
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tablet Pro',
        description: 'Pantalla retina de 12.9 pulgadas, compatible con stylus y teclado magnético.',
        price: 799.00,
        categoryId: catMap.get('tecnologia')!,
        categoryName: 'Tecnología',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop',
      }
    }),
  ])

  console.log('✅ Productos creados:', products.length)
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
