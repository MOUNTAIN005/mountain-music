import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', JPG: 'image/jpeg', PNG: 'image/png',
  png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  wav: 'audio/wav', mp3: 'audio/mpeg', flac: 'audio/flac', ogg: 'audio/ogg',
  mp4: 'video/mp4', pdf: 'application/pdf',
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const filePath = join(process.cwd(), 'public', ...path)
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const ext = (path[path.length - 1]?.split('.').pop() || '').toLowerCase()
  const buffer = readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes',
    },
  })
}
