import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear all existing data for a fresh start
  console.log('Clearing existing data...')
  await prisma.song.deleteMany()
  await prisma.album.deleteMany()
  await prisma.recommendedSong.deleteMany()
  await prisma.story.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.setting.deleteMany()
  console.log('Existing data cleared')
  // Create admin user (idempotent)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mountainmusic.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: '山影知道',
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create default settings (idempotent - upsert)
  const settings = [
    { key: 'siteTitle', value: '山影知道 | MOUNTAIN Music' },
    { key: 'siteDescription', value: '让声音记录灵魂 - 个人音乐艺术网站' },
    { key: 'logo', value: 'EchoSoul' },
    { key: 'bannerTitle', value: '让声音 记录灵魂' },
    { key: 'bannerSubtitle', value: '在旋律的海洋中，每一次振动都是灵魂的低语' },
    { key: 'email', value: 'hello@mountainmusic.com' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
