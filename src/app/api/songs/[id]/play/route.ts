import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const songId = parseInt(id)
    if (isNaN(songId) || songId <= 0) {
      return NextResponse.json({ success: false, error: '无效的歌曲ID' }, { status: 400 })
    }
    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
