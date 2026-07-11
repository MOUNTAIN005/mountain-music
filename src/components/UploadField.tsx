'use client'

import { useState, useRef } from 'react'
import { Upload, Check, X, FileAudio, ImageIcon } from 'lucide-react'

interface UploadFieldProps {
  accept: string
  label: string
  onUpload: (url: string) => void
  currentUrl?: string
  preview?: boolean
}

export default function UploadField({ accept, label, onUpload, currentUrl, preview }: UploadFieldProps) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const isAudio = accept.includes('audio')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setStatus('idle')

    const fd = new FormData()
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
          }
        } catch {
          setStatus('error')
        }
      } else {
        setStatus('error')
      }
      setProgress(0)
    }

    xhr.onerror = () => {
      setUploading(false)
      setStatus('error')
      setProgress(0)
    }

    xhr.open('POST', '/api/upload')
    xhr.send(fd)

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 block">{label}</label>

      {/* Current file preview */}
      {currentUrl && preview && !isAudio && (
        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden mb-2">
          <img src={currentUrl} className="w-full h-full object-cover" alt="" />
        </div>
      )}

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
             isAudio ? (currentUrl ? currentUrl.split('/').pop() : '选择音频文件') : (currentUrl ? currentUrl.split('/').pop() : '选择图片文件')}
          </span>
        </label>
      </div>

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
