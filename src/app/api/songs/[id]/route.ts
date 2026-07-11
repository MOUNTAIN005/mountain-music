import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const song = await prisma.song.findUnique({ where: { id: parseInt(id) } })
    if (!song) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: song })
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取歌曲失败' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const song = await prisma.song.update({ where: { id: parseInt(id) }, data: body })
    return NextResponse.json({ success: true, data: song })
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新歌曲失败' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.song.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: '删除歌曲失败' }, { status: 500 })
  }
}
