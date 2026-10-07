import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getRecommendedSongs } from '@/lib/public-data'

export async function GET() {
  try {
    const songs = await getRecommendedSongs()
    return NextResponse.json({ success: true, data: songs }, { headers: cacheHeaders })
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
    revalidateTag('recommended-songs')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}
