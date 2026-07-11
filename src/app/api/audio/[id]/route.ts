import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'
import prisma from '@/lib/prisma'

// Map of song titles to their filenames
const songFileMap: Record<string, string> = {
  '萤火': '萤火（Completed）.wav',
  '边缘': '边缘（Completed）.wav',
  '风要怎么停息': '风要怎么停息 (Completed).wav',
  '我做了个梦': '我做了个梦（Completed）.wav',
  'Tina': 'Tina(Completed).wav',
  '路边角落里的猫': '路边角落里的猫（Completed）.wav',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const songId = parseInt(id)

  if (isNaN(songId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid ID' },
      { status: 400 }
    )
  }

  try {
    // Try to get song from database
    let song = await prisma.song.findUnique({ where: { id: songId } })

    if (!song) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    const musicDir = join(process.cwd(), 'music')
    const filename = songFileMap[song.title] || song.title
    const filePath = join(musicDir, filename)

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Audio file not found' },
        { status: 404 }
      )
    }

    // Increment play count
    await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    })

    // Read and serve the file
    const fileBuffer = await fs.readFile(filePath)
    const fileStat = await fs.stat(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(fileStat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Audio serve error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to serve audio' },
      { status: 500 }
    )
  }
}
