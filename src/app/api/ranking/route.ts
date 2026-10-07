import { NextResponse } from 'next/server'
import { cacheHeaders, getRankingSongs } from '@/lib/public-data'

export async function GET() {
  try {
    const songs = await getRankingSongs()
    return NextResponse.json({ success: true, data: songs }, { headers: cacheHeaders })
  } catch (error) {
    console.error('Get ranking error:', error)
    return NextResponse.json(
      { success: false, error: '获取排行榜失败' },
      { status: 500 }
    )
  }
}
