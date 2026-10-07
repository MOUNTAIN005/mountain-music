import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const songs = await prisma.recommendedSong.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(
      { success: true, data: songs },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
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
    const nextSongs = songs.map((song, index) => ({
      title: song.title || '',
      artist: song.artist || '山影知道',
      coverUrl: song.coverUrl || null,
      audioUrl: song.audioUrl || '',
      description: song.description || null,
      lyrics: song.lyrics || null,
      album: song.album || null,
      sortOrder: index,
    }))

    await prisma.$transaction([
      prisma.recommendedSong.deleteMany(),
      ...nextSongs.map((data) => prisma.recommendedSong.create({ data })),
    ])

    revalidateTag('recommended-songs')
    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch {
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 })
  }
}
