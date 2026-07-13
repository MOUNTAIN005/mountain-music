'use client'

import { useState, useEffect } from 'react'
import { Save, Music, Plus } from 'lucide-react'
import UploadField from '@/components/UploadField'

interface RecSong {
  title: string; artist: string; coverUrl: string; audioUrl: string; description: string; lyrics: string; album: string
}
interface SongOption { id: number; title: string; artist: string; audioUrl: string; description: string; lyrics: string; album?: { title: string } }

export default function AdminRecommendPage() {
  const [allSongs, setAllSongs] = useState<SongOption[]>([])
  const [songs, setSongs] = useState<RecSong[]>([])
  const addSong = () => setSongs(prev => [...prev, { title: '', artist: '山影知道', coverUrl: '', audioUrl: '', description: '', lyrics: '', album: '' }])
  const removeSong = (idx: number) => setSongs(prev => prev.filter((_, i) => i !== idx))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/albums?all=true').then(r => r.json()).then(d => {
      if (d.success && d.data) {
        const flat: SongOption[] = []
        for (const a of d.data) {
          for (const s of (a.songs || [])) {
            flat.push({ id: s.id, title: s.title, artist: s.artist, audioUrl: s.audioUrl || '', description: s.description || '', lyrics: s.lyrics || '', album: a })
          }
        }
        setAllSongs(flat)
      }
    }).catch(() => {})
    fetch('/api/recommended-songs').then(r => r.json()).then(d => {
      if (d.success && d.data && d.data.length > 0) {
        setSongs(d.data.map((s: any) => ({ title: s.title, artist: s.artist, coverUrl: s.coverUrl || '', audioUrl: s.audioUrl || '', description: s.description || '', lyrics: s.lyrics || '', album: s.album || '' })))
      }
    })
  }, [])

  const upd = (idx: number, field: keyof RecSong, val: string) => {
    const s = [...songs]; s[idx] = { ...s[idx], [field]: val }; setSongs(s)
  }

  const selectSong = (idx: number, option: SongOption) => {
    const s = [...songs]
    s[idx] = {
      title: option.title,
      artist: option.artist || '山影知道',
      coverUrl: s[idx].coverUrl, // keep existing cover
      audioUrl: option.audioUrl || '',
      description: option.description || '',
      lyrics: option.lyrics || '',
      album: option.album?.title || '',
    }
    setSongs(s)
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
      <h1 className="text-xl font-bold text-gradient mb-2">推荐歌曲编辑 — 关联专辑歌曲</h1>
      <p className="text-xs text-gray-500 mb-6">从已有专辑中选择歌曲，封面可单独上传。共 {songs.length} 首</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {songs.map((s, i) => (
          <div key={i} className="p-4 rounded-xl glass space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">歌曲 {i + 1}</h3>
              {songs.length > 1 && (
                <button onClick={() => removeSong(i)} className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors px-2 py-0.5 rounded border border-red-400/20 hover:border-red-400/40">删除</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Cover upload */}
              <div className="col-span-2">
                <UploadField accept="image/*" label={`封面${i+1}`} onUpload={(url) => upd(i, 'coverUrl', url)} currentUrl={s.coverUrl} preview />
              </div>

              {/* Song selector from existing albums */}
              <div className="col-span-2">
                <label className="text-xs text-gray-400 block mb-1.5">关联专辑歌曲</label>
                <select
                  onChange={e => { const opt = allSongs.find(o => o.id === parseInt(e.target.value)); if (opt) selectSong(i, opt) }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50"
                  defaultValue=""
                >
                  <option value="" disabled>选择歌曲...</option>
                  {allSongs.map(o => (
                    <option key={o.id} value={o.id}>{o.title} — {o.artist}{o.album ? ` (${o.album.title})` : ''}</option>
                  ))}
                </select>
                {s.audioUrl && (
                  <p className="text-[10px] text-green-500/70 mt-1">已关联音频</p>
                )}
              </div>

              <input value={s.title} onChange={e => upd(i, 'title', e.target.value)}
                className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="歌曲名称" />
              <input value={s.album} onChange={e => upd(i, 'album', e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="专辑名称" />
              <input value={s.artist} onChange={e => upd(i, 'artist', e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none" placeholder="艺术家" />

              <textarea value={s.description} onChange={e => upd(i, 'description', e.target.value)}
                rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none" placeholder="歌曲说明" />
              <textarea value={s.lyrics} onChange={e => upd(i, 'lyrics', e.target.value)}
                rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none" placeholder="歌词（可选）" />
            </div>
          </div>
        ))}

      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => addSong()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/10">
          <Plus size={15} />添加歌曲
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all">
          <Save size={15} />{saving ? '保存中...' : '保存推荐歌曲'}
        </button>
      </div>
    </div>
  )
}
