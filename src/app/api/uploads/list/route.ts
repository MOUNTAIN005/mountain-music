import { NextResponse } from 'next/server'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')

  try {
    const files = readdirSync(uploadDir).filter(f =>
      f.match(/\.(wav|mp3|flac|ogg|aac|m4a|jpg|jpeg|png|webp|gif)$/i)
    )

    const result = files.map(f => {
      const ext = f.split('.').pop()?.toLowerCase() || ''
      const url = `/api/uploads/${f}`
      return {
        name: f,
        url,
        size: statSync(join(uploadDir, f)).size,
        ext,
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
