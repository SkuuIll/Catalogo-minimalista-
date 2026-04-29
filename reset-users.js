#!/usr/bin/env node
// Reset users — deletes all users and creates a fresh admin
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function reset() {
  const email = process.argv[2] || 'admin@aura.com'
  const password = process.argv[3] || 'Aura2026!'
  const name = process.argv[4] || 'Admin'

  console.log(`\n🔄 Reseteando usuarios…`)

  // Delete all users
  await prisma.user.deleteMany()
  console.log('   ✓ Todos los usuarios eliminados')

  // Delete all sessions (clear cookies)
  // (SQLite doesn't have a sessions table, so nothing to do here)

  // Create new admin
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hash, name },
  })

  console.log(`   ✓ Usuario creado: ${email}`)
  console.log(`   ✓ Contraseña: ${password}`)
  console.log(`\n✅ Listo. Podés iniciar sesión en /login\n`)

  await prisma.$disconnect()
}

reset().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})