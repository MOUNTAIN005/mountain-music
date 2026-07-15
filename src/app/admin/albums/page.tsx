'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Save, Disc3, Music, Upload, X, Heart, Pencil, RotateCcw, ChevronDown, ChevronUp, Layers, CheckCircle, AlertCircle } from 'lucide-react'

interface SongForm { id?: number; title: string; artist: string; audioUrl: string; description: string; lyrics: string; isRecommended?: boolean; duration?: number }
interface AlbumForm { title: string; description: string; coverUrl: string; songs: SongForm[] }
interface AlbumData { id: number; title: string; description: string | null; coverUrl: string | null; isPublished: boolean; songs: any[] }

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<AlbumData[]>([])
  const [saving, setSaving] = useState(false)
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null)
  const [form, setForm] = useState<AlbumForm>({ title: '', description: '', coverUrl: '', songs: [{ title: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '', isRecommended: false }] })
  const [audioUploading, setAudioUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFileName, setUploadedFileName] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => { loadAlbums() }, [])

  const togglePublish = async (id: number, pub: boolean) => { try { await fetch(`/api/albums/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: pub }) }); loadAlbums(); } catch {} }
  const toggleSongRec = async (songId: number, isRec: boolean) => { try { await fetch(`/api/songs/${songId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRecommended: isRec }) }); loadAlbums(); } catch {} }
  const deleteAlbum = async (id: number) => { if (!confirm("确定要删除此专辑及所有歌曲吗？")) return; try { await fetch(`/api/albums/${id}`, { method: "DELETE" }); loadAlbums(); } catch {} }

  const loadAlbums = async () => {
    try {
      const r = await fetch('/api/albums?all=true'); const d = await r.json()
      if (d.success) setAlbums(d.data || [])
    } catch {}
  }

  const uploadFileWithProgress = (file: File, type: 'image' | 'audio', key: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fd = new FormData()
      fd.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(prev => ({ ...prev, [key]: pct }))
        }
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const d = JSON.parse(xhr.responseText)
            if (d.success) resolve(d.data.url)
            else reject(new Error(d.error || '上传失败'))
          } catch { reject(new Error('解析响应失败')) }
        } else {
          reject(new Error('上传失败 (' + xhr.status + ')'))
        }
      }
      xhr.onerror = () => reject(new Error('网络错误'))
      xhr.send(fd)
    })
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadedFileName(prev => ({ ...prev, cover: file.name }))
    setUploadProgress(prev => ({ ...prev, cover: 0 }))
    try {
      const url = await uploadFileWithProgress(file, 'image', 'cover')
      if (url) {
        setForm(f => ({ ...f, coverUrl: url }))
        showToast('封面上传成功！')
      }
    } catch (err: any) {
      showToast(err.message || '封面上传失败', 'error')
    }
  }

  const handleAudioUpload = async (idx: number, file: File) => {
    setAudioUploading(true)
    const key = 'audio_' + idx
    setUploadedFileName(prev => ({ ...prev, [key]: file.name }))
    setUploadProgress(prev => ({ ...prev, [key]: 0 }))
    try {
      const url = await uploadFileWithProgress(file, 'audio', key)
      if (url) {
        let duration = 0
        try {
          const tmpAudio = new Audio(URL.createObjectURL(file))
          await new Promise<void>((resolve) => {
            tmpAudio.onloadedmetadata = () => { duration = Math.round(tmpAudio.duration) || 0; resolve() }
            tmpAudio.onerror = () => resolve()
          })
        } catch {}
        const s = [...form.songs]; s[idx] = { ...s[idx], audioUrl: url, duration }
        setForm(f => ({ ...f, songs: s }))
        showToast('音频上传成功！')
      }
    } catch (err: any) {
      showToast(err.message || '音频上传失败', 'error')
    }
    setAudioUploading(false)
  }

  const addSong = () => setForm(f => ({ ...f, songs: [...f.songs, { title: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '', isRecommended: false }] }))
  const removeSong = (idx: number) => setForm(f => ({ ...f, songs: f.songs.filter((_, i) => i !== idx) }))
  const toggleSongRecommend = (idx: number) => {
    const s = [...form.songs]; s[idx] = { ...s[idx], isRecommended: !s[idx].isRecommended }; setForm(f => ({ ...f, songs: s }))
  }
  const updSong = (idx: number, field: keyof SongForm, value: string) => {
    const s = [...form.songs]; s[idx] = { ...s[idx], [field]: value }; setForm(f => ({ ...f, songs: s }))
  }

  const handleEditAlbum = async (album: AlbumData) => {
    setEditingAlbumId(album.id)
    setForm({
      title: album.title,
      description: album.description || '',
      coverUrl: album.coverUrl || '',
      songs: (album.songs || []).map((s: any) => ({
        id: s.id,
        title: s.title || '',
        artist: s.artist || '山影知道',
        audioUrl: s.audioUrl || '',
        isRecommended: s.isRecommended || false,
        description: s.description || '',
        lyrics: s.lyrics || '',
      })),
    })
  }

  const handleCancelEdit = () => {
    setEditingAlbumId(null)
    setForm({ title: '', description: '', coverUrl: '', songs: [{ title: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '', isRecommended: false }] })
  }

  const handleSave = async () => {
    if (!form.title) { alert('请输入专辑名称'); return }
    setSaving(true)
    try {
      if (editingAlbumId) {
        await fetch(`/api/albums/${editingAlbumId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.title, description: form.description, coverUrl: form.coverUrl || null }),
        })
        for (const s of form.songs) {
          if (!s.title) continue
          if (s.id) {
            await fetch(`/api/songs/${s.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: s.title, artist: s.artist || '山影知道', audioUrl: s.audioUrl, description: s.description, lyrics: s.lyrics, genre: '原创', albumId: editingAlbumId, duration: s.duration || 0, isRecommended: s.isRecommended || false }),
            })
          } else if (s.audioUrl) {
            await fetch('/api/songs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: s.title, artist: s.artist || '山影知道', audioUrl: s.audioUrl, description: s.description, lyrics: s.lyrics, genre: '原创', albumId: editingAlbumId, isPublished: true, duration: s.duration || 0, isRecommended: s.isRecommended || false }) })
          }
        }
        setEditingAlbumId(null)
        alert('专辑更新成功！')
      } else {
        const r = await fetch('/api/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, description: form.description, coverUrl: form.coverUrl || null, isPublished: false }) })
        const d = await r.json()
        if (!d.success) throw new Error('Failed to create album')
        const albumId = d.data.id
        for (const s of form.songs) { if (!s.title || !s.audioUrl) continue; await fetch('/api/songs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: s.title, artist: s.artist || '山影知道', audioUrl: s.audioUrl, description: s.description, lyrics: s.lyrics, genre: '原创', albumId, isPublished: true, duration: s.duration || 0, isRecommended: false }) }) }
        alert('专辑创建成功！')
      }
      setForm({ title: '', description: '', coverUrl: '', songs: [{ title: '', artist: '山影知道', audioUrl: '', description: '', lyrics: '', isRecommended: false }] })
      await loadAlbums()
    } catch (e: any) { alert('操作失败: ' + e.message) }
    setSaving(false)
  }

  return (
    <div>
     <h1 className="text-xl font-bold text-gradient mb-6">创建专辑</h1>
 
      {/* Create Form (when not editing) */}
      {!editingAlbumId && (
        <div className="p-5 rounded-xl glass space-y-5 mb-8 max-w-2xl">
          {/* Cover upload */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">专辑封面</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                {form.coverUrl ? <img src={form.coverUrl} className="w-full h-full object-cover" alt="" /> : <Disc3 size={28} className="text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20" />
                    {uploadedFileName.cover && (
                      <p className="text-[11px] text-green-400 mt-1.5 truncate">
                        {uploadProgress.cover === 100 ? '✅ ' : ''}{uploadedFileName.cover}
                      </p>
                    )}
                    {uploadProgress.cover !== undefined && uploadProgress.cover < 100 && (
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: uploadProgress.cover + '%' }} />
                      </div>
                    )}
                  </div>
            </div>
          </div>
          <div><label className="text-xs text-gray-400 block mb-1">专辑名称</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="输入专辑名称" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">专辑说明</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="专辑简介" /></div>
          {/* Songs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">歌曲列表</label>
              <button onClick={addSong} className="flex items-center gap-1 text-xs text-accent-purple hover:text-white transition-colors"><Plus size={14} />添加歌曲</button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {form.songs.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">歌曲 {i + 1}</span>
                    {form.songs.length > 1 && <button onClick={() => removeSong(i)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={s.title} onChange={e => updSong(i, 'title', e.target.value)} className="col-span-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />
                    <input value={s.artist} onChange={e => updSong(i, 'artist', e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="艺术家" />
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 cursor-pointer hover:bg-white/10 truncate">
                        <Upload size={14} />{s.audioUrl ? '已上传音频' : '上传音频'}
                        <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(i, f) }} />
                      </label>
                      {uploadedFileName['audio_' + i] && (
                        <p className="text-[11px] text-green-400 mt-1 truncate">
                          {uploadProgress['audio_' + i] === 100 ? '✅ ' : ''}{uploadedFileName['audio_' + i]}
                        </p>
                      )}
                      {uploadProgress['audio_' + i] !== undefined && uploadProgress['audio_' + i] < 100 && (
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: uploadProgress['audio_' + i] + '%' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <input value={s.description} onChange={e => updSong(i, 'description', e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="歌曲说明" />
                  <textarea value={s.lyrics} onChange={e => updSong(i, 'lyrics', e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="时间轴歌词（如 [00:15.030]词：）" />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
            <Save size={16} />{saving ? '保存中...' : '保存专辑'}
          </button>
        </div>
      )}

     {/* ====== Layout: Albums grid (left) + Edit panel (right) ====== */}
      <div className="flex gap-6 items-start">
        {/* ====== LEFT: Album Cards Grid ====== */}
        <div className={`min-w-0 transition-all duration-300 ${editingAlbumId ? 'w-[60%]' : 'w-full'}`}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers size={18} className="text-accent-purple/60" />
            已有专辑与歌曲
            <span className="text-xs text-gray-600 font-normal">({albums.length} 张专辑)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {albums.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Disc3 size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-600">暂无专辑，在上方创建一个吧</p>
              </div>
            )}

            <AnimatePresence>
              {albums.map((album) => (
                <motion.div
                  key={album.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: editingAlbumId && editingAlbumId !== album.id ? 0.2 : 1,
                    scale: editingAlbumId && editingAlbumId !== album.id ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                  className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
                    editingAlbumId === album.id
                      ? 'border-accent-purple/40 bg-accent-purple/[0.04] shadow-lg shadow-accent-purple/10 ring-1 ring-accent-purple/20'
                      : editingAlbumId ? 'border-white/[0.03] bg-white/[0.01]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                  style={editingAlbumId && editingAlbumId !== album.id ? { pointerEvents: 'none' } : undefined}
                >
                  <div className="p-4">
                    {/* Top row: cover + info + action buttons */}
                    <div className="flex items-start gap-3 relative">
                      {/* Action buttons - top right corner */}
                      {!editingAlbumId && (
                        <div className="absolute top-0 right-0 flex items-center gap-0.5 z-10">
                          <button onClick={() => handleEditAlbum(album)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-accent-blue hover:bg-white/10 transition-all" title="编辑"><Pencil size={14} /></button>
                          <button onClick={() => togglePublish(album.id, !album.isPublished)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/10 transition-all" title={album.isPublished ? '取消前台显示' : '前台显示'}>
                            <Heart size={14} className={album.isPublished ? 'text-red-400' : ''} fill={album.isPublished ? '#f43f5e' : 'none'} /></button>
                          <button onClick={() => deleteAlbum(album.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/10 transition-all" title="删除"><Trash2 size={14} /></button>
                        </div>
                      )}

                      {/* Album cover thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center overflow-hidden shrink-0">
                        {album.coverUrl
                          ? <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
                          : <Disc3 size={24} className="text-accent-purple/40" />
                        }
                      </div>

                      {/* Album info */}
                      <div className="flex-1 min-w-0 pr-16">
                        <h3 className="text-sm font-semibold text-white truncate">{album.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">{album.songs?.length || 0} 首歌曲</p>
                        {album.description && (
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{album.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Songs list */}
                    <div className="mt-4 space-y-1">
                      {(album.songs || []).length === 0 && (
                        <p className="text-[11px] text-gray-600 italic">暂无歌曲</p>
                      )}
                      {(album.songs || []).map((song: any) => (
                        <div key={song.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <Music size={11} className="text-gray-600 shrink-0" />
                          <span className="text-xs text-gray-300 flex-1 truncate">{song.title}</span>
                          <span className="text-[10px] text-gray-500 shrink-0">{song.artist}</span>
                          <button onClick={() => toggleSongRec(song.id, !song.isRecommended)}
                            className={`p-1 rounded transition-all ${
                              song.isRecommended ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
                            }`}
                            title={song.isRecommended ? '取消前台推荐' : '推荐到前台'}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={song.isRecommended ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ====== RIGHT: Edit Panel (when editing) ====== */}
        {editingAlbumId && (
          <div className="w-[40%] shrink-0 sticky top-24 self-start">
            <div className="p-5 rounded-xl glass border border-accent-purple/30 space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">编辑专辑</h2>
                <button onClick={handleCancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"><X size={14} />关闭</button>
              </div>

              {/* Cover upload */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">专辑封面</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    {form.coverUrl ? <img src={form.coverUrl} className="w-full h-full object-cover" alt="" /> : <Disc3 size={28} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20" />
                  </div>
                    {uploadedFileName.cover && (
                      <p className="text-[11px] text-green-400 mt-1.5 truncate">
                        {uploadProgress.cover === 100 ? '✅ ' : ''}{uploadedFileName.cover}
                      </p>
                    )}
                    {uploadProgress.cover !== undefined && uploadProgress.cover < 100 && (
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: uploadProgress.cover + '%' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div><label className="text-xs text-gray-400 block mb-1">专辑名称</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="专辑名称" /></div>

              <div><label className="text-xs text-gray-400 block mb-1">专辑说明</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="专辑简介" /></div>

              {/* Songs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">歌曲列表</label>
                  <button onClick={addSong} className="flex items-center gap-1 text-xs text-accent-purple hover:text-white transition-colors"><Plus size={14} />添加歌曲</button>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {form.songs.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">歌曲 {i + 1}{s.id ? '' : ' (新)'}</span>
                        {s.isRecommended && <span className="text-[9px] text-yellow-600/70 border border-yellow-600/20 px-1.5 py-0.5 rounded-full">前台推荐</span>}
                        {form.songs.length > 1 && <button onClick={() => removeSong(i)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={s.title} onChange={e => updSong(i, 'title', e.target.value)} className="col-span-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />
                        <input value={s.artist} onChange={e => updSong(i, 'artist', e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="艺术家" />
                        <div className="col-span-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 cursor-pointer hover:bg-white/10 truncate">
                            <Upload size={14} />{s.audioUrl ? '已上传' : '上传音频'}
                            <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(i, f) }} />
                          </label>
                          {uploadedFileName['audio_' + i] && (
                            <p className="text-[11px] text-green-400 mt-1 truncate">
                              {uploadProgress['audio_' + i] === 100 ? '✅ ' : ''}{uploadedFileName['audio_' + i]}
                            </p>
                          )}
                          {uploadProgress['audio_' + i] !== undefined && uploadProgress['audio_' + i] < 100 && (
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: uploadProgress['audio_' + i] + '%' }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <input value={s.description} onChange={e => updSong(i, 'description', e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50" placeholder="歌曲说明" />
                      <textarea value={s.lyrics} onChange={e => updSong(i, 'lyrics', e.target.value)} rows={2} className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-accent-purple/50 resize-none" placeholder="时间轴歌词" />
                      <button onClick={() => toggleSongRecommend(i)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                          s.isRecommended
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'text-gray-600 hover:text-yellow-500 border border-transparent hover:border-yellow-500/30 hover:bg-white/5'
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={s.isRecommended ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={s.isRecommended ? "text-yellow-400" : ""}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        {s.isRecommended ? '前台推荐中' : '推荐到前台'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  <Save size={16} />{saving ? '保存中...' : '保存修改'}
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-all">
                  <RotateCcw size={14} />取消
                </button>
              </div>
            </div>
        )}
      </div>
          {/* Toast notification */}
      {toast && toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600/90 text-white border border-green-500/30'
              : 'bg-red-600/90 text-white border border-red-500/30'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} className="text-green-200" /> : <AlertCircle size={18} className="text-red-200" />}
            {toast.message}
          </div>
        </div>
      )}</div>
  )
}
