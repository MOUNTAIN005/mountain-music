import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheHeaders, getStories } from '@/lib/public-data'

 export async function GET(request: Request) {
   try {
     const url = new URL(request.url)
     const showAll = url.searchParams.get('all') === 'true'
    const stories = await getStories(showAll)
     return NextResponse.json({ success: true, data: stories }, { headers: cacheHeaders })
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
        imageUrl: body.imageUrl || null,
        submittedBy: body.name,
        submitterEmail: body.email,
        status: 'pending',
      },
    })
    revalidateTag('stories')
    return NextResponse.json({ success: true, data: story }, { status: 201 })
  } catch (error) {
    console.error('Create story error:', error)
    return NextResponse.json(
      { success: false, error: '投稿失败' },
      { status: 500 }
    )
  }
}
