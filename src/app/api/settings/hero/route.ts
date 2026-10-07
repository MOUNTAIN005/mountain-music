import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getHeroData } from '@/lib/public-data'

export async function GET() {
  const data = await getHeroData()
  return NextResponse.json({ success: true, data }, { headers: cacheHeaders })
}

export async function PUT(req: Request) {
  const body = await req.json()
  await prisma.setting.upsert({
    where: { key: 'hero_data' },
    update: { value: JSON.stringify(body) },
    create: { key: 'hero_data', value: JSON.stringify(body) },
  })
  revalidateTag('settings')
  return NextResponse.json({ success: true })
}
