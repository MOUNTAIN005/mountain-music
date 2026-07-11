import { NextResponse } from 'next/server'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
  const useApiUrl = !!process.env.UPLOAD_DIR

  try {
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ success: true, data: [] })
    }

    const files = readdirSync(uploadDir).filter(f =>
      f.match(/\.(wav|mp3|flac|ogg|aac|m4a|jpg|jpeg|png|webp|gif)$/i)
    )

    const result = files.map(f => ({
      name: f,
      url: useApiUrl ? `/api/uploads/${f}` : `/uploads/${f}`,
      size: statSync(join(uploadDir, f)).size,
      ext: f.split('.').pop(),
    }))

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
