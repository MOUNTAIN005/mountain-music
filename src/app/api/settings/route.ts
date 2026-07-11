import { NextResponse } from 'next/server'; import { prisma } from '@/lib/prisma'
export async function GET() {
  const s = await prisma.setting.findMany()
  return NextResponse.json({ success: true, data: s.reduce((a: any, x: any) => ({ ...a, [x.key]: x.value }), {}) })
}
export async function PUT(req: Request) {
  const body = await req.json()
  for (const [k, v] of Object.entries(body)) await prisma.setting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } })
  return NextResponse.json({ success: true })
}
