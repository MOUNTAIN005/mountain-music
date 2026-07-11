import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const songs = await prisma.recommendedSong.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ success: true, data: songs })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function PUT(req: Request) {
  try {
    const songs = await req.json()
    if (!Array.isArray(songs)) {
      return NextResponse.json({ success: false, error: '需要数组格式' }, { status: 400 })
    }
    // Replace all: delete old, insert new
    await prisma.recommendedSong.deleteMany()
    for (let i = 0; i < songs.length; i++) {
      const s = songs[i]
      await prisma.recommendedSong.create({
        data: {
          title: s.title || '',
          artist: s.artist || '山影知道',
          coverUrl: s.coverUrl || null,
          audioUrl: s.audioUrl || '',
          description: s.description || null,
          lyrics: s.lyrics || null,
          album: s.album || null,
          sortOrder: i,
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}
