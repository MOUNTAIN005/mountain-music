'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, CheckCircle, Trash2 } from 'lucide-react'
import UploadField from '@/components/UploadField'

export default function AdminHeroPage() {
  const [data, setData] = useState({ bgImage: '', coverImage: '', title: '', album: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '' })
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [allSongs, setAllSongs] = useState<any[]>([])

  const [selectedSongId, setSelectedSongId] = useState('')
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
  }, [])

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(d => {
      if (d.success) setAllSongs(d.data || [])
    }).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    let ok = false
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
      ok = true
    } catch {}
    setSaving(false)
    if (ok) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  return (
    <div>
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-xl shadow-emerald-500/10"
          >
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-emerald-300">保存成功</span>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* Song selector */}
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">从已有歌曲选择（自动填充）</label>
            <select
              value={selectedSongId}
              onChange={e => {
                const val = e.target.value
                setSelectedSongId(val)
                if (val) {
                  const song = allSongs.find((s: any) => s.id === Number(val))
                  if (song) {
                    setData(d => ({
                      ...d,
                      title: song.title,
                      album: song.album?.title || '',
                      artist: song.artist,
                      audioUrl: song.audioUrl,
                      lyrics: song.lyrics || '',
                    }))
                  }
                }
              }}
              disabled={!selectedSongId && !!data.audioUrl}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">手动输入</option>
              {allSongs.map((s: any) => (
                <option key={s.id} value={String(s.id)}>{s.album?.title ? s.album.title + ' - ' : ''}{s.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))}
              className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />
            <input value={data.album} onChange={e => setData(d => ({ ...d, album: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="专辑名称" />
            <input value={data.artist} onChange={e => setData(d => ({ ...d, artist: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="艺术家" />

            {/* Audio - mutual exclusion */}
            {selectedSongId ? (
              <div className="col-span-2 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">音频来源</p>
                <p className="text-xs text-gray-400 mt-1">已关联歌曲音频</p>
                <p className="text-[10px] text-gray-600 mt-1">如需修改请先选择「手动输入」</p>
              </div>
            ) : (
              <div className="col-span-2">
                <UploadField
                  accept="audio/*"
                  label="选择/上传音频"
                  onUpload={(url) => setData(d => ({ ...d, audioUrl: url }))}
                  currentUrl={data.audioUrl}
                  oldFileUrl={data.audioUrl}
                />
                {data.audioUrl && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      onClick={() => setData(d => ({ ...d, audioUrl: '' }))}
                      className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />删除音频
                    </button>
                  </div>
                )}
              </div>
            )}

            <textarea value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))}
              rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="写一句寄语或引用……" />
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
