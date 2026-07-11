import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const album = await prisma.album.findUnique({ where: { id: parseInt(id) }, include: { songs: true } })
  if (!album) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: album })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await req.json()
  const album = await prisma.album.update({ where: { id: parseInt(id) }, data: body, include: { songs: true } })
  return NextResponse.json({ success: true, data: album })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.album.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
