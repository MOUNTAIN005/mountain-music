import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getAlbums } from '@/lib/public-data'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url); const showAll = url.searchParams.get("all") === "true";
    const albums = showAll
      ? await prisma.album.findMany({
          include: { songs: true },
          orderBy: { createdAt: 'desc' },
        })
      : await getAlbums(false)
    return NextResponse.json(
      { success: true, data: albums },
      { headers: showAll ? { 'Cache-Control': 'no-store, max-age=0' } : cacheHeaders },
    )
  } catch (error) {
    console.error('Get albums error:', error)
    return NextResponse.json(
      { success: false, error: '获取专辑列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const album = await prisma.album.create({ data: body })
    revalidateTag('albums')
    return NextResponse.json({ success: true, data: album }, { status: 201 })
  } catch (error) {
    console.error('Create album error:', error)
    return NextResponse.json(
      { success: false, error: '创建专辑失败' },
      { status: 500 }
    )
  }
}
