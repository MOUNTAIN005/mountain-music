import { NextResponse } from 'next/server'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'

const MAX_AUDIO_SIZE = 100 * 1024 * 1024
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Blob storage is not configured' },
        { status: 503 },
      )
    }

    const body = await request.json()
    const fileName = typeof body.fileName === 'string' ? body.fileName : ''
    const fileSize = Number(body.fileSize) || 0
    const fileType = typeof body.fileType === 'string' ? body.fileType : ''

    if (!fileName) {
      return NextResponse.json({ success: false, error: '缺少文件名' }, { status: 400 })
    }

    const isAudio = fileType.startsWith('audio/') || /\.(mp3|wav|flac|ogg|aac|m4a)$/i.test(fileName)
    const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)

    if (!isAudio && !isImage) {
      return NextResponse.json({ success: false, error: '不支持的文件类型' }, { status: 400 })
    }

    if (isAudio && !/\.mp3$/i.test(fileName) && !fileType.includes('mpeg')) {
      return NextResponse.json({ success: false, error: '仅支持 MP3 格式的音频文件' }, { status: 400 })
    }

    const maximumSizeInBytes = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE
    if (fileSize > maximumSizeInBytes) {
      return NextResponse.json({ success: false, error: '文件过大' }, { status: 413 })
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${isAudio ? 'audio' : 'images'}/${Date.now()}-${safeFileName}`
    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
      pathname: storagePath,
      allowedContentTypes: fileType
        ? [fileType]
        : [isAudio ? 'audio/mpeg' : 'image/*'],
      maximumSizeInBytes,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      data: { clientToken, storagePath },
    })
  } catch (error) {
    console.error('[Upload Token Error]', error)
    return NextResponse.json(
      { success: false, error: '生成上传凭证失败' },
      { status: 500 },
    )
  }
}
