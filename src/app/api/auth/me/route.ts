import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: '无效令牌' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json({ success: false, error: '获取用户信息失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: '无效令牌' }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: '邮箱格式不正确' }, { status: 400 })
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== payload.userId) {
        return NextResponse.json({ success: false, error: '该邮箱已被使用' }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json({ success: false, error: '更新信息失败' }, { status: 500 })
  }
}
