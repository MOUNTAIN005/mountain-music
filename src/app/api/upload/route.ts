import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: '未提供文件' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use /tmp/uploads/ on Railway, public/uploads/ locally
    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
    mkdirSync(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadDir, fileName)
    writeFileSync(filePath, buffer)

    // On Railway, serve through API; locally use static files
    const baseUrl = process.env.UPLOAD_DIR ? `/api/uploads/${fileName}` : `/uploads/${fileName}`

    return NextResponse.json({ success: true, data: { url: baseUrl, fileName } })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 })
  }
}
