import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Aura',
      siteTagline: 'Catálogo Premium',
      heroTitle: 'Curaduría de Objetos Esenciales',
      heroSubtitle: 'Un catálogo minimalista con artículos de alta calidad diseñados para el estilo de vida moderno. La simplicidad es la máxima sofisticación.',
      primaryColor: '#d4a853',
      showCategories: true,
      whatsappNumber: '',
      whatsappMessage: 'Hola, estoy interesado en el producto:',
    },
  })
  console.log('✅ SiteSettings creado')

  // Limpiar
  await prisma.specification.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Categorías padre
  const catTecnologia = await prisma.category.create({ data: { name: 'Tecnología', slug: 'tecnologia', icon: 'laptop', order: 0 } })
  const catAudio = await prisma.category.create({ data: { name: 'Audio', slug: 'audio', icon: 'headphones', order: 1 } })
  const catAccesorios = await prisma.category.create({ data: { name: 'Accesorios', slug: 'accesorios', icon: 'watch', order: 2 } })
  const catRopa = await prisma.category.create({ data: { name: 'Ropa', slug: 'ropa', icon: 'shirt', order: 3 } })

  // Subcategorías
  const subCelulares = await prisma.category.create({ data: { name: 'Celulares', slug: 'celulares', icon: 'smartphone', order: 0, parentId: catTecnologia.id } })
  const subLaptops = await prisma.category.create({ data: { name: 'Laptops', slug: 'laptops', icon: 'laptop', order: 1, parentId: catTecnologia.id } })
  const subTablets = await prisma.category.create({ data: { name: 'Tablets', slug: 'tablets', icon: 'tablet', order: 2, parentId: catTecnologia.id } })
  const subAuriculares = await prisma.category.create({ data: { name: 'Auriculares', slug: 'auriculares', icon: 'headphones', order: 0, parentId: catAudio.id } })
  const subParlantes = await prisma.category.create({ data: { name: 'Parlantes', slug: 'parlantes', icon: 'speaker', order: 1, parentId: catAudio.id } })
  const subRelojes = await prisma.category.create({ data: { name: 'Relojes', slug: 'relojes', icon: 'watch', order: 0, parentId: catAccesorios.id } })
  const subCamisetas = await prisma.category.create({ data: { name: 'Camisetas', slug: 'camisetas', icon: 'shirt', order: 0, parentId: catRopa.id } })

  console.log('✅ Categorías creadas')

  // Productos
  const productsData = [
    {
      name: 'Smartphone Pro X',
      description: 'Último modelo con cámara profesional de 108MP, batería de 5000mAh y pantalla OLED de 120Hz.',
      price: 999.99,
      status: 'AVAILABLE',
      categoryId: subCelulares.id,
      categoryName: 'Celulares',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Pantalla', value: '6.7" OLED 120Hz' },
        { key: 'Procesador', value: 'Snapdragon 8 Gen 3' },
        { key: 'RAM', value: '12GB' },
        { key: 'Almacenamiento', value: '256GB' },
        { key: 'Cámara', value: '108MP principal' },
        { key: 'Batería', value: '5000mAh' },
      ]
    },
    {
      name: 'Auriculares NoiseCancel',
      description: 'Cancelación activa de ruido, sonido Hi-Res Audio y 30 horas de autonomía.',
      price: 249.50,
      status: 'AVAILABLE',
      categoryId: subAuriculares.id,
      categoryName: 'Auriculares',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Tipo', value: 'Over-ear inalámbricos' },
        { key: 'ANC', value: 'Sí, adaptativo' },
        { key: 'Autonomía', value: '30 horas' },
        { key: 'Bluetooth', value: '5.3' },
        { key: 'Peso', value: '250g' },
      ]
    },
    {
      name: 'Reloj Minimalista',
      description: 'Diseño elegante con correa de cuero genuino y caja de acero inoxidable cepillado.',
      price: 120.00,
      status: 'PREORDER',
      categoryId: subRelojes.id,
      categoryName: 'Relojes',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Material caja', value: 'Acero inoxidable' },
        { key: 'Correa', value: 'Cuero genuino' },
        { key: 'Movimiento', value: 'Cuarzo suizo' },
        { key: 'Resistencia agua', value: '50m' },
      ]
    },
    {
      name: 'Laptop Ultraligera',
      description: 'Procesador de última generación, 16GB RAM y SSD de 512GB en un cuerpo de 1.2kg.',
      price: 1299.00,
      status: 'AVAILABLE',
      categoryId: subLaptops.id,
      categoryName: 'Laptops',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Procesador', value: 'Intel Core i7-13700H' },
        { key: 'RAM', value: '16GB DDR5' },
        { key: 'Almacenamiento', value: '512GB NVMe SSD' },
        { key: 'Pantalla', value: '14" IPS 2.8K' },
        { key: 'Peso', value: '1.2kg' },
      ]
    },
    {
      name: 'Tablet Pro 12',
      description: 'Pantalla retina de 12.9 pulgadas, compatible con stylus y teclado magnético.',
      price: 799.00,
      status: 'OUT_OF_STOCK',
      categoryId: subTablets.id,
      categoryName: 'Tablets',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Pantalla', value: '12.9" Liquid Retina' },
        { key: 'Procesador', value: 'M2' },
        { key: 'RAM', value: '8GB' },
        { key: 'Almacenamiento', value: '128GB' },
        { key: 'Stylus', value: 'Compatible' },
      ]
    },
    {
      name: 'Parlante Bluetooth',
      description: 'Sonido 360°, resistente al agua IPX7, 20 horas de batería.',
      price: 89.99,
      status: 'AVAILABLE',
      categoryId: subParlantes.id,
      categoryName: 'Parlantes',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Potencia', value: '30W' },
        { key: 'Resistencia', value: 'IPX7' },
        { key: 'Autonomía', value: '20 horas' },
        { key: 'Bluetooth', value: '5.2' },
      ]
    },
    {
      name: 'Camiseta Premium',
      description: 'Algodón orgánico 100%, corte slim fit y acabados de alta calidad.',
      price: 45.00,
      status: 'AVAILABLE',
      categoryId: subCamisetas.id,
      categoryName: 'Camisetas',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Material', value: 'Algodón orgánico 100%' },
        { key: 'Corte', value: 'Slim fit' },
        { key: 'Origen', value: 'Portugal' },
      ]
    },
    {
      name: 'Smartwatch Active',
      description: 'Monitoreo de salud, GPS integrado, resistencia al agua 5ATM.',
      price: 199.00,
      status: 'PREORDER',
      categoryId: subRelojes.id,
      categoryName: 'Relojes',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=500&auto=format&fit=crop',
      specs: [
        { key: 'Pantalla', value: '1.4" AMOLED' },
        { key: 'Sensores', value: 'SpO2, HR, GPS' },
        { key: 'Resistencia agua', value: '5ATM' },
        { key: 'Autonomía', value: '7 días' },
      ]
    },
  ]

  for (const p of productsData) {
    const { specs, ...productData } = p as any
    const product = await prisma.product.create({
      data: productData
    })
    if (specs) {
      await prisma.specification.createMany({
        data: specs.map((s: any) => ({ ...s, productId: product.id }))
      })
    }
  }

  console.log('✅ Productos creados:', productsData.length)
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
