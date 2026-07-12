import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const socials = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: socials })
  } catch (error) {
    console.error('Get socials error:', error)
    return NextResponse.json(
      { success: false, error: '获取社交链接失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const items = body.items || []

    // Upsert each social link
    for (const item of items) {
      if (!item.platform || !item.name) continue
      await prisma.socialLink.upsert({
        where: { platform: item.platform },
        update: {
          name: item.name,
          accountName: item.accountName || '',
          qrCodeUrl: item.qrCodeUrl || null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
        },
        create: {
          platform: item.platform,
          name: item.name,
          accountName: item.accountName || '',
          qrCodeUrl: item.qrCodeUrl || null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update socials error:', error)
    return NextResponse.json(
      { success: false, error: '更新社交链接失败' },
      { status: 500 }
    )
  }
}
