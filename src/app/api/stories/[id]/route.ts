import { NextResponse } from 'next/server'; import { prisma } from '@/lib/prisma'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = await prisma.story.findUnique({ where: { id: parseInt(id) } })
  if (!story) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: story })
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await req.json()
  const story = await prisma.story.update({ where: { id: parseInt(id) }, data: body })
  return NextResponse.json({ success: true, data: story })
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; await prisma.story.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
