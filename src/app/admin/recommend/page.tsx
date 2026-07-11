'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import UploadField from '@/components/UploadField'

interface RecSong {
  title: string; artist: string; coverUrl: string; audioUrl: string; description: string; lyrics: string; album: string
}

export default function AdminRecommendPage() {
  const [songs, setSongs] = useState<RecSong[]>(
    Array.from({ length: 5 }, () => ({ title: '', artist: '山影知道', coverUrl: '', audioUrl: '', description: '', lyrics: '', album: '' }))
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/recommended-songs').then(r => r.json()).then(d => {
      if (d.success && d.data && d.data.length > 0) {
        setSongs(d.data.map((s: any) => ({ title: s.title, artist: s.artist, coverUrl: s.coverUrl || '', audioUrl: s.audioUrl || '', description: s.description || '', lyrics: s.lyrics || '', album: s.album || '' })))
      }
    })
  }, [])

  const upd = (idx: number, field: keyof RecSong, val: string) => {
    const s = [...songs]; s[idx] = { ...s[idx], [field]: val }; setSongs(s)
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/recommended-songs', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songs),
    })
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gradient mb-2">推荐歌曲编辑</h1>
      <p className="text-xs text-gray-500 mb-6">编辑前台首页展示的 5 首推荐歌曲</p>

      <div className="space-y-4 max-w-3xl">
        {songs.map((s, i) => (
          <div key={i} className="p-4 rounded-xl glass space-y-3">
            <h3 className="text-sm font-medium text-white">歌曲 {i + 1}</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Cover upload with progress bar */}
              <div className="col-span-2">
                <UploadField accept="image/*" label={`封面${i+1}`} onUpload={(url) => upd(i, 'coverUrl', url)} currentUrl={s.coverUrl} preview />
              </div>

              <input value={s.title} onChange={e => upd(i, 'title', e.target.value)}
                className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="歌曲名称" />
              <input value={s.album} onChange={e => upd(i, 'album', e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="专辑名称" />
              <input value={s.artist} onChange={e => upd(i, 'artist', e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="艺术家" />

              {/* Audio upload with progress bar */}
              <div className="col-span-2">
                <UploadField accept="audio/*" label={`音频${i+1}`} onUpload={(url) => upd(i, 'audioUrl', url)} currentUrl={s.audioUrl} />
              </div>

              <textarea value={s.description} onChange={e => upd(i, 'description', e.target.value)}
                rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none" placeholder="歌曲说明" />
              <textarea value={s.lyrics} onChange={e => upd(i, 'lyrics', e.target.value)}
                rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none" placeholder="歌词（可选）" />
            </div>
          </div>
        ))}

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg disabled:opacity-50">
          <Save size={16} />{saving ? '保存中...' : '保存推荐歌曲'}
        </button>
      </div>
    </div>
  )
}
