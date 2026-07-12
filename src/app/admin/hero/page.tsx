'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import UploadField from '@/components/UploadField'

export default function AdminHeroPage() {
  const [data, setData] = useState({ bgImage: '', coverImage: '', title: '', album: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '' })
  const [saving, setSaving] = useState(false)
  const [audioFiles, setAudioFiles] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.success && d.data?.hero_data) { 
        try { 
          const parsed = JSON.parse(d.data.hero_data)
          // Only use parsed data if it's a valid object
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setData(parsed)
          }
        } catch {} 
      }
    })
    fetch('/api/uploads/list').then(r => r.json()).then(d => {
      if (d.success) setAudioFiles(d.data.filter((f: any) => f.ext?.match(/wav|mp3|flac|ogg/)))
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_data: JSON.stringify(data) }),
      })
    } catch {}
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gradient mb-2">HERO编辑</h1>
      <p className="text-xs text-gray-500 mb-6">编辑首页全屏 Hero 区的展示内容</p>

      <div className="max-w-2xl space-y-5">
        {/* Background + Cover */}
        <div className="p-4 rounded-xl glass space-y-4">
          <h3 className="text-sm font-medium text-white">背景与封面</h3>
          <UploadField accept="image/*" label="背景图片" onUpload={(url) => setData(d => ({ ...d, bgImage: url }))} currentUrl={data.bgImage} preview />
          <UploadField accept="image/*" label="专辑封面" onUpload={(url) => setData(d => ({ ...d, coverImage: url }))} currentUrl={data.coverImage} preview />
        </div>

        {/* Song Info */}
        <div className="p-4 rounded-xl glass space-y-3">
          <h3 className="text-sm font-medium text-white">歌曲信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))}
              className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />
            <input value={data.album} onChange={e => setData(d => ({ ...d, album: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="专辑名称" />
            <input value={data.artist} onChange={e => setData(d => ({ ...d, artist: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="艺术家" />

            {/* Audio */}
            <div className="col-span-2">
              <UploadField accept="audio/*" label="选择/上传音频" onUpload={(url) => setData(d => ({ ...d, audioUrl: url }))} currentUrl={data.audioUrl} />
              {audioFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-gray-600">或选择已上传的音频：</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {audioFiles.map(f => (
                      <label key={f.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${data.audioUrl === f.url ? 'bg-accent-purple/20 text-accent-purple' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        <input type="radio" name="hero-audio" checked={data.audioUrl === f.url} onChange={() => setData(d => ({ ...d, audioUrl: f.url }))} className="accent-accent-purple" />
                        {f.name.length > 30 ? f.name.slice(0, 30) + '...' : f.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <textarea value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))}
              rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="歌曲说明" />
            <textarea value={data.lyrics} onChange={e => setData(d => ({ ...d, lyrics: e.target.value }))}
              rows={3} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="时间轴歌词" />
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg disabled:opacity-50">
          <Save size={16} />{saving ? '保存中...' : '保存HERO设置'}
        </button>
      </div>
    </div>
  )
}
