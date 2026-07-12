import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlinkSync } from 'fs'
import { join } from 'path'

function fileUrlToPath(url: string): string {
  if (!url) return ''
  const baseDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
  return join(baseDir, url.replace('/api/uploads/', ''))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Get the social link to find associated QR code file
    const social = await prisma.socialLink.findUnique({ where: { id: parseInt(id) } })
    if (social?.qrCodeUrl) {
      // Delete the QR code image file from filesystem
      try { unlinkSync(fileUrlToPath(social.qrCodeUrl)) } catch {}
    }
    await prisma.socialLink.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete social error:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
