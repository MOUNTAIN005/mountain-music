import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      where: { isPublished: true },
      orderBy: { playCount: 'desc' },
      take: 10,
    })
    return NextResponse.json({ success: true, data: songs })
  } catch (error) {
    console.error('Get ranking error:', error)
    return NextResponse.json(
      { success: false, error: '获取排行榜失败' },
      { status: 500 }
    )
  }
}
