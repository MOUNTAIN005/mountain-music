import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
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

  // Create songs
  const songs = [
    {
      title: '萤火',
      artist: '山影知道',
      audioUrl: '/api/uploads/萤火（Completed）.wav',
      description: '黑夜中的微光，是希望的低语',
      genre: '流行',
      duration: 240,
      sortOrder: 1,
    },
    {
      title: '边缘',
      artist: '山影知道',
      audioUrl: '/api/uploads/边缘（Completed）.wav',
      description: '行走在梦境与现实之间',
      genre: '民谣',
      duration: 210,
      sortOrder: 2,
    },
    {
      title: '风要怎么停息',
      artist: '山影知道',
      audioUrl: '/api/uploads/风要怎么停息 (Completed).wav',
      description: '当思念化作无法停止的风',
      genre: '流行',
      duration: 195,
      sortOrder: 3,
    },
    {
      title: '我做了个梦',
      artist: '山影知道',
      audioUrl: '/api/uploads/我做了个梦（Completed）.wav',
      description: '梦里有一切美好的可能',
      genre: '民谣',
      duration: 225,
      sortOrder: 4,
    },
    {
      title: 'Tina',
      artist: '山影知道',
      audioUrl: '/api/uploads/Tina(Completed).wav',
      description: '献给你，Tina',
      genre: '流行',
      duration: 200,
      sortOrder: 5,
    },
    {
      title: '路边角落里的猫',
      artist: '山影知道',
      audioUrl: '/api/uploads/路边角落里的猫（Completed）.wav',
      description: '城市角落里的温暖相遇',
      genre: '民谣',
      duration: 180,
      sortOrder: 6,
    },
  ]

  for (const songData of songs) {
    const existing = await prisma.song.findFirst({
      where: { title: songData.title },
    })
    if (!existing) {
      await prisma.song.create({ data: songData })
      console.log('Created song:', songData.title)
    }
  }

  // Create stories
  const stories = [
    {
      title: '《萤火》——黑夜中的微光',
      author: '山影知道',
      content:
        '这首歌写于一个失眠的深夜。那时我独自坐在窗前，看着远处零星的路灯，想起了小时候在乡下看到的萤火虫。\n\n那些微小的光亮，虽然不足以照亮整个世界，但足以温暖一个人的心。\n\n我想，每个人的生命中都有这样的时刻——觉得自己渺小如萤火，但也正是这些微光，汇聚成了我们继续前行的力量。',
      status: 'approved',
    },
    {
      title: '《边缘》——在梦与醒之间',
      author: '山影知道',
      content:
        '边缘，是一个很特别的位置。\n\n它既不属于这边，也不属于那边。就像半梦半醒之间，你能感受到两个世界的气息。\n\n这首歌想要表达的，就是这种游离的状态。在现实与理想之间，在喧嚣与宁静之间，在坚持与放弃之间...\n\n每一个选择，都让我们站在新的边缘。',
      status: 'approved',
    },
  ]

  for (const storyData of stories) {
    const existing = await prisma.story.findFirst({
      where: { title: storyData.title },
    })
    if (!existing) {
      await prisma.story.create({ data: storyData })
      console.log('Created story:', storyData.title)
    }
  }

  // Create settings
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
