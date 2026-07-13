import { generateClientToken } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
    }

    const { fileName, fileType } = body

    if (!fileName) {
      return NextResponse.json({ success: false, error: '缺少文件名' }, { status: 400 })
    }

    // Validate file type
    const isAudio = fileType?.startsWith('audio/') || /\.(mp3|wav|flac|ogg|aac|m4a)$/i.test(fileName)
    const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)

    if (!isAudio && !isImage) {
      return NextResponse.json({ success: false, error: '不支持的文件类型' }, { status: 400 })
    }

    // Only MP3 audio allowed
    if (isAudio) {
      if (!/\.mp3$/i.test(fileName) && !fileType?.includes('mpeg')) {
        return NextResponse.json({ success: false, error: '仅支持 MP3 格式的音频文件' }, { status: 400 })
      }
    }

    const subDir = isAudio ? 'audio' : 'images'
    const storagePath = `${subDir}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const allowedTypes = isAudio ? ['audio/mpeg'] : ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    const clientToken = await generateClientToken({
      allowedContentTypes: allowedTypes,
      maximumSizeInBytes: isAudio ? 100 * 1024 * 1024 : 20 * 1024 * 1024,
    })

    return NextResponse.json({
      success: true,
      data: { clientToken, storagePath, subDir },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Upload Token Error]', message)
    return NextResponse.json({ success: false, error: `获取上传凭证失败: ${message}` }, { status: 500 })
  }
}
