import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url); const showAll = url.searchParams.get("all") === "true";
    const albums = await prisma.album.findMany({
      where: showAll ? {} : { isPublished: true },
      include: { songs: showAll ? true : { where: { isPublished: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: albums })
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
    return NextResponse.json({ success: true, data: album }, { status: 201 })
  } catch (error) {
    console.error('Create album error:', error)
    return NextResponse.json(
      { success: false, error: '创建专辑失败' },
      { status: 500 }
    )
  }
}
