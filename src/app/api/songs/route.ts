import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getSongs } from '@/lib/public-data'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recommended = url.searchParams.get("recommended") === "true";
    const songs = await getSongs(recommended)
    return NextResponse.json({ success: true, data: songs }, { headers: cacheHeaders })
  } catch (error) {
    console.error('Get songs error:', error)
    return NextResponse.json(
      { success: false, error: '获取歌曲列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const song = await prisma.song.create({ data: body })
    revalidateTag('songs')
    return NextResponse.json({ success: true, data: song }, { status: 201 })
  } catch (error) {
    console.error('Create song error:', error)
    return NextResponse.json(
      { success: false, error: '创建歌曲失败' },
      { status: 500 }
    )
  }
}
