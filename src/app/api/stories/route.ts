import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
 try {
   const stories = await prisma.story.findMany({
     where: { status: 'approved', isDisplayed: true },
     orderBy: { createdAt: 'desc' },
   })
   return NextResponse.json({ success: true, data: stories })
  } catch (error) {
    console.error('Get stories error:', error)
    return NextResponse.json(
      { success: false, error: '获取故事列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const story = await prisma.story.create({
      data: {
        title: body.title,
        author: body.name,
        content: body.content,
        submittedBy: body.name,
        submitterEmail: body.email,
        status: 'pending',
      },
    })
    return NextResponse.json({ success: true, data: story }, { status: 201 })
  } catch (error) {
    console.error('Create story error:', error)
    return NextResponse.json(
      { success: false, error: '投稿失败' },
      { status: 500 }
    )
  }
}
