import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'recommend_data' } })
  const data = setting ? JSON.parse(setting.value) : null
  return NextResponse.json({ success: true, data })
}

export async function PUT(req: Request) {
  const body = await req.json()
  await prisma.setting.upsert({
    where: { key: 'recommend_data' },
    update: { value: JSON.stringify(body) },
    create: { key: 'recommend_data', value: JSON.stringify(body) },
  })
  return NextResponse.json({ success: true })
}
