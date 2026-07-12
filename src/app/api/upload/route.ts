import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const AUDIO_EXTS = /\.(mp3|wav|flac|ogg|aac|m4a)$/i

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: '未提供文件' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Detect file type: audio or image
    const isAudio = file.type.startsWith('audio/') || AUDIO_EXTS.test(file.name)
    const subDir = isAudio ? 'audio' : 'images'

    const baseDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
    const uploadDir = join(baseDir, subDir)
    mkdirSync(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    writeFileSync(join(uploadDir, fileName), buffer)

    const url = `/api/uploads/${subDir}/${fileName}`

    return NextResponse.json({ success: true, data: { url, fileName, type: subDir } })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 })
  }
}
