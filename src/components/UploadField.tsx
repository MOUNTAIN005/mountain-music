'use client'

import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Upload, Check, X, FileAudio, ImageIcon } from 'lucide-react'

interface UploadFieldProps {
  children?: ReactNode
  accept: string
  label: string
  onUpload: (url: string) => void
  currentUrl?: string
  preview?: boolean
  uploadContext?: string
  oldFileUrl?: string
}

export default function UploadField({ accept, label, onUpload, currentUrl, preview, uploadContext, oldFileUrl, children }: UploadFieldProps) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isAudio = accept.includes('audio')
  const isHero = uploadContext === 'hero'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side format validation
    if (isAudio && !isHero) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (ext !== 'mp3' && !file.type.includes('mpeg')) {
        setErrorMessage('仅支持 MP3 格式的音频文件')
        setStatus('error')
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    // Show file name in status
    setUploading(true)
    setProgress(0)
    setStatus('idle')
    setErrorMessage('')

    const blobDone = await tryBlobUpload(file)
    if (blobDone) { setUploading(false); setProgress(0); if (inputRef.current) inputRef.current.value = ''; return }

    const fd = new FormData()
    if (uploadContext) fd.append('context', uploadContext)
    if (oldFileUrl) fd.append('oldFileUrl', oldFileUrl)
    fd.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100))
      }
    }

    xhr.onload = () => {
      setUploading(false)
      if (xhr.status === 200) {
        try {
          const resp = JSON.parse(xhr.responseText)
          if (resp.success) {
            onUpload(resp.data.url)
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
          } else {
            setStatus('error')
            setErrorMessage(resp.error || '上传失败')
          }
        } catch {
          setStatus('error')
          setErrorMessage('服务器响应解析失败')
        }
      } else {
        // Try to extract error message from response body
        let serverError = ''
        try {
          const resp = JSON.parse(xhr.responseText)
          serverError = resp.error || ''
        } catch {}
        setStatus('error')
        setErrorMessage(serverError || `服务器错误 (${xhr.status})`)
      }
      setProgress(0)
    }

    xhr.onerror = () => {
      setUploading(false)
      setStatus('error')
      setErrorMessage('网络错误，请检查连接')
      setProgress(0)
    }

    xhr.open('POST', '/api/upload')
    xhr.send(fd)

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  async function tryBlobUpload(file: File): Promise<boolean> {
    try {
      const tokenRes = await fetch('/api/upload/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, fileType: file.type }),
      })
      if (!tokenRes.ok) return false

      const { success, data } = await tokenRes.json()
      if (!success || !data?.clientToken) return false

      let blobClient: any
      try {
        blobClient = await import('@vercel/blob/client')
      } catch {
        return false
      }

      const blob = await blobClient.upload(data.storagePath, file, {
        clientToken: data.clientToken,
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          const pct = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0
          setProgress(pct)
        },
      })

      onUpload(blob.url)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 block">{label}</label>

      {/* Current file preview + extra actions */}
      {(currentUrl && preview && !isAudio) || children ? (
        <div className="flex items-center gap-3 mb-2">
          {currentUrl && preview && !isAudio && (
            <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden shrink-0">
              <img src={currentUrl} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          {children}
        </div>
      ) : null}
      {/* Upload area */}
      <div className="relative">
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" id={`upload-${label}`} />
        <label htmlFor={`upload-${label}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-all text-xs ${
            status === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' :
            status === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-400' :
            'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          {status === 'success' ? <Check size={14} /> :
           status === 'error' ? <X size={14} /> :
           isAudio ? <FileAudio size={14} /> : <Upload size={14} />}
          <span className="flex-1 truncate">
            {uploading ? `上传中 ${progress}%` :
             status === 'success' ? '上传成功' :
             status === 'error' ? '上传失败，请重试' :
             isAudio ? (currentUrl ? currentUrl.split('/').pop() : '上传音频') : (currentUrl ? currentUrl.split('/').pop() : '选择图片文件')}
          </span>
        </label>
      </div>

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <p className="text-[11px] text-red-400 mt-1">{errorMessage}</p>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
