import { NextResponse } from 'next/server'
import { createWriteStream, mkdirSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { put, del } from '@vercel/blob'

export const maxDuration = 60

const AUDIO_EXTS = /\.(mp3|wav|flac|ogg|aac|m4a)$/i
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MP3_ONLY = /\.mp3$/i
const MAX_FILE_SIZE_SUBMIT = 700 * 1024 // 700KB for story submissions

function getMaxFileSize(context: string): number {
  if (context === 'submit') return MAX_FILE_SIZE_SUBMIT
  return MAX_FILE_SIZE
}

// Convert /api/uploads/... URL to filesystem path
function fileUrlToPath(url: string): string {
  if (!url) return ''
  const baseDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
  return join(baseDir, url.replace('/api/uploads/', ''))
}

const isBlobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN

async function persistFile(storagePath: string, buffer: Buffer): Promise<string> {
  if (isBlobEnabled) {
    const blob = await put(storagePath, buffer, { access: 'public', addRandomSuffix: false })
    return blob.url
  }
  const baseDir = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads')
  const fullPath = join(baseDir, storagePath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, buffer)
  return `/api/uploads/${storagePath}`
}

async function deleteStorageFile(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return
  if (isBlobEnabled && urlOrPath.startsWith('http')) {
    try { await del(urlOrPath) } catch {}
  } else {
    try { unlinkSync(fileUrlToPath(urlOrPath)) } catch {}
  }
}

export async function POST(request: Request) {
  try {
    // Get the Content-Type header to extract the boundary
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: '请求格式错误，需要 multipart/form-data' }, { status: 400 })
    }

    // Try streaming upload with busboy first (handles large files without body size limits)
    const busboyResult = await getBusboy()
    if (busboyResult) return await handleStreamingUpload(request, contentType, busboyResult)

    // Fallback to the standard formData approach
    return await handleFormDataUpload(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Upload Error]', { message, name: error instanceof Error ? error.name : undefined })
    return NextResponse.json({ success: false, error: `上传失败: ${message}` }, { status: 500 })
  }
}

// Try to load busboy from various sources
async function getBusboy(): Promise<any> {
  try {
    // @ts-expect-error - Next.js's compiled busboy has no type declarations
    const mod = await import('next/dist/compiled/busboy')
    return mod.default || mod
  } catch {
    return null
  }
}

async function handleStreamingUpload(request: Request, contentType: string, busboy: any): Promise<Response> {
  // Ensure the upload is a node request with the raw body
  // In Next.js route handlers, we need to get the raw body from the request
  const body = request.body
  if (!body) {
    return NextResponse.json({ success: false, error: '请求体为空' }, { status: 400 })
  }

  return new Promise<Response>((resolve, reject) => {
    const boundary = contentType.split('boundary=')[1]?.trim()
    if (!boundary) {
      resolve(NextResponse.json({ success: false, error: '缺少 multipart boundary' }, { status: 400 }))
      return
    }

    const bb = busboy({ headers: { 'content-type': contentType } })
    let fileFound = false
    let uploadComplete = false
    let fileSize = 0
    let fileName = ''
    let context = ''
    let oldFileUrl = ''

    bb.on('file', (_fieldname: string, file: import('stream').Readable, info: { filename: string; encoding: string; mimeType: string }) => {
      if (fileFound) { file.resume(); return }
      fileFound = true

      const originalName = info.filename
      const mimeType = info.mimeType
      fileName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      const isAudio = mimeType.startsWith('audio/') || AUDIO_EXTS.test(originalName)
      const isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(originalName)


      // Only MP3 audio allowed
      if (isAudio) {
        const isMp3 = MP3_ONLY.test(originalName) || mimeType.includes('mpeg')
        if (!isMp3) {
          file.resume()
          resolve(NextResponse.json({ success: false, error: '仅支持 MP3 格式的音频文件' }, { status: 400 }))
          return
        }
      }
      if (!isAudio && !isImage) {
        file.resume()
        resolve(NextResponse.json({ success: false, error: '不支持的文件类型' }, { status: 400 }))
        return
      }

      const subDir = isAudio ? 'audio' : 'images'
      const blobPath = `${subDir}/${fileName}`
      const chunks: Buffer[] = []

      file.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
        fileSize += chunk.length
        const maxSize = getMaxFileSize(context)
        if (fileSize > maxSize) {
          file.destroy()
          chunks.length = 0
          const mb = (maxSize / 1024 / 1024).toFixed(maxSize >= 1024 * 1024 ? 1 : 3)
          resolve(NextResponse.json({ success: false, error: `文件过大（超过 ${maxSize >= 1024 * 1024 ? mb + 'MB' : Math.round(maxSize / 1024) + 'KB'}）` }, { status: 413 }))
        }
      })

      file.on('error', () => {
        chunks.length = 0
        if (!uploadComplete) resolve(NextResponse.json({ success: false, error: '文件流读取失败' }, { status: 500 }))
      })

      file.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const url = await persistFile(blobPath, buffer)
          if (oldFileUrl) await deleteStorageFile(oldFileUrl)
          uploadComplete = true
          resolve(NextResponse.json({ success: true, data: { url, fileName, type: subDir } }))
        } catch (err: any) {
          if (!uploadComplete) resolve(NextResponse.json({ success: false, error: `上传失败: ${err.message}` }, { status: 500 }))
        }
      })
    })

    bb.on('finish', () => {
      if (!fileFound && !uploadComplete) {
        resolve(NextResponse.json({ success: false, error: '未找到上传文件' }, { status: 400 }))
      }
    })


    bb.on('field', (fieldname: string, val: string) => {
      if (fieldname === 'context') context = val
      if (fieldname === 'oldFileUrl') oldFileUrl = val
    })
    bb.on('error', (err: Error) => {
      console.error('[Busboy Error]', err.message)
      if (!uploadComplete) resolve(NextResponse.json({ success: false, error: `上传处理失败: ${err.message}` }, { status: 500 }))
    })

    // Pipe the request body through busboy
    const reader = body.getReader()
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            bb.end()
            break
          }
          bb.write(value)
        }
      } catch (err: any) {
        if (!uploadComplete) resolve(NextResponse.json({ success: false, error: `上传流处理失败: ${err.message}` }, { status: 500 }))
      }
    }
    pump()
  })
}

async function handleFormDataUpload(request: Request): Promise<Response> {
  const formData = await request.formData()
  const formContext = (formData.get('context') as string) || ''
  const formOldFileUrl = (formData.get('oldFileUrl') as string) || ''
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ success: false, error: '未提供文件' }, { status: 400 })

  if (file.size > MAX_FILE_SIZE) {
    const maxSize = getMaxFileSize(formContext)
    if (file.size > maxSize) {
      const mb = (maxSize / 1024 / 1024).toFixed(maxSize >= 1024 * 1024 ? 1 : 3)
      return NextResponse.json({ success: false, error: `文件过大（${(file.size / 1024).toFixed(0)}KB），最大支持 ${maxSize >= 1024 * 1024 ? mb + 'MB' : Math.round(maxSize / 1024) + 'KB'}` }, { status: 413 })
    }
  }

  const isAudio = file.type.startsWith('audio/') || AUDIO_EXTS.test(file.name)
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)

  // Only MP3 audio allowed
  if (isAudio) {
    if (!MP3_ONLY.test(file.name) && !file.type.includes('mpeg')) {
      return NextResponse.json({ success: false, error: '仅支持 MP3 格式的音频文件' }, { status: 400 })
    }
  }
  if (!isAudio && !isImage) {
    return NextResponse.json({ success: false, error: '不支持的文件类型' }, { status: 400 })
  }

  const subDir = isAudio ? 'audio' : 'images'

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  // Delete old file first if this was a replacement upload
  if (formOldFileUrl) {
    await deleteStorageFile(formOldFileUrl)
  }

  const blobPath = `${subDir}/${fileName}`
  const url = await persistFile(blobPath, buffer)

  return NextResponse.json({ success: true, data: { url, fileName, type: subDir } })
}
