import { NextResponse } from 'next/server'; import { readdirSync, statSync } from 'fs'; import { join } from 'path'
export async function GET() {
  const dir = join(process.cwd(), 'public', 'uploads')
  try {
    const files = readdirSync(dir).filter(f => f.match(/\.(wav|mp3|flac|ogg|aac|m4a|jpg|jpeg|png|webp|gif)$/i))
    const result = files.map(f => ({ name: f, url: '/uploads/' + f, size: statSync(join(dir, f)).size, ext: f.split('.').pop() }))
    return NextResponse.json({ success: true, data: result })
  } catch { return NextResponse.json({ success: true, data: [] }) }
}
