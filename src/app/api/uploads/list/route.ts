import { NextResponse } from 'next/server'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')

  try {
    const result: { name: string; url: string; size: number; ext: string; type: string }[] = []

    for (const subDir of ['images', 'audio']) {
      const dirPath = join(uploadDir, subDir)
      if (!existsSync(dirPath)) continue

      const files = readdirSync(dirPath)
      for (const f of files) {
        const ext = f.split('.').pop()?.toLowerCase() || ''
        result.push({
          name: f,
          url: `/api/uploads/${subDir}/${f}`,
          size: statSync(join(dirPath, f)).size,
          ext,
          type: subDir,
        })
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
