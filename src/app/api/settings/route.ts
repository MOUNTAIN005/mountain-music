import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getSettingsMap } from '@/lib/public-data'

export async function GET() {
  const data = await getSettingsMap()
  return NextResponse.json({ success: true, data }, { headers: cacheHeaders })
}

export async function PUT(req: Request) {
  const body = await req.json()
  for (const [k, v] of Object.entries(body)) await prisma.setting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } })
  revalidateTag('settings')
  return NextResponse.json({ success: true })
}
