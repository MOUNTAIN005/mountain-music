import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif',
  mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
  ogg: 'audio/ogg', aac: 'audio/aac', m4a: 'audio/mp4',
}

const ALLOWED_SUBDIRS = ['images', 'audio']

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const segments = (await params).file

  if (!segments || segments.length === 0) {
    return NextResponse.json({ success: false, error: 'No file specified' }, { status: 400 })
  }

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')

  const sanitize = (name: string) =>
    name.includes('..') || name.includes('/') || name.includes('\\')

  let filePath: string
  let fileName: string

  if (segments.length === 1) {
    // Legacy: /api/uploads/file.jpg — try root, then images/, then audio/
    const name = segments[0]
    if (sanitize(name)) {
      return NextResponse.json({ success: false, error: 'Invalid file' }, { status: 400 })
    }
    filePath = join(uploadDir, name)
    if (!existsSync(filePath)) {
      filePath = join(uploadDir, 'images', name)
      if (!existsSync(filePath)) {
        filePath = join(uploadDir, 'audio', name)
      }
    }
    fileName = name
  } else if (segments.length === 2) {
    // New: /api/uploads/images/file.jpg or /api/uploads/audio/file.wav
    const [subdir, name] = segments
    if (!ALLOWED_SUBDIRS.includes(subdir) || sanitize(name)) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 })
    }
    filePath = join(uploadDir, subdir, name)
    fileName = name
  } else {
    return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 })
  }

  try {
    const data = readFileSync(filePath)
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
  }
}
