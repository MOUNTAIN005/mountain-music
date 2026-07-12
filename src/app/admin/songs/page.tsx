'use client'

 import { useState, useEffect } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { Plus, Edit2, Trash2, Music, Save, Upload, X, Heart, Star } from 'lucide-react'
 
 interface SongForm {
   id?: number
   title: string
   artist: string
   genre: string
   audioUrl: string
   coverUrl: string
   description: string
   lyrics: string
   duration: number
   isPublished: boolean
   isRecommended: boolean
   albumId: number | null
 }
 
 const emptySong = (): SongForm => ({
   title: '', artist: '山影知道', genre: '原创',
   audioUrl: '', coverUrl: '', description: '', lyrics: '',
   duration: 0, isPublished: true, isRecommended: false, albumId: null,
 })

 interface Song extends SongForm {
   id: number
   playCount: number
   likeCount: number
   createdAt: string
   album?: { id: number; title: string } | null
 }

export default function AdminSongsPage() {
   const [songs, setSongs] = useState<Song[]>([])
   const [albums, setAlbums] = useState<{ id: number; title: string }[]>([])
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
   const [modalOpen, setModalOpen] = useState(false)
   const [editingId, setEditingId] = useState<number | null>(null)
   const [form, setForm] = useState<SongForm>(emptySong())
   const [audioUploading, setAudioUploading] = useState(false)
 
   useEffect(() => {
     loadSongs()
     loadAlbums()
   }, [])
 
   const loadSongs = async () => {
     try {
       const r = await fetch('/api/songs'); const d = await r.json()
       if (d.success) setSongs(d.data || [])
     } catch {} finally { setLoading(false) }
   }
 
   const loadAlbums = async () => {
     try {
       const r = await fetch('/api/albums?all=true'); const d = await r.json()
       if (d.success) setAlbums((d.data || []).map((a: any) => ({ id: a.id, title: a.title })))
     } catch {}
   }
 
   const uploadFile = async (file: File): Promise<string> => {
     const fd = new FormData(); fd.append('file', file)
     const r = await fetch('/api/upload', { method: 'POST', body: fd })
     const d = await r.json()
     return d.success ? d.data.url : ''
   }
 
   const handleAudioUpload = async (file: File) => {
     setAudioUploading(true)
     const url = await uploadFile(file)
     if (url) {
       let duration = 0
       try {
         const tmpAudio = new Audio(URL.createObjectURL(file))
         await new Promise<void>((resolve) => {
           tmpAudio.onloadedmetadata = () => { duration = Math.round(tmpAudio.duration) || 0; resolve() }
           tmpAudio.onerror = () => resolve()
         })
       } catch {}
       setForm(f => ({ ...f, audioUrl: url, duration }))
     }
     setAudioUploading(false)
   }
 
   const handleCoverUpload = async (file: File) => {
     const url = await uploadFile(file)
     if (url) setForm(f => ({ ...f, coverUrl: url }))
   }
 
   const openCreate = () => {
     setEditingId(null)
     setForm(emptySong())
     setModalOpen(true)
   }
 
   const openEdit = (song: Song) => {
     setEditingId(song.id)
     setForm({
       title: song.title, artist: song.artist, genre: song.genre || '原创',
       audioUrl: song.audioUrl, coverUrl: song.coverUrl || '',
       description: song.description || '', lyrics: song.lyrics || '',
       duration: song.duration || 0, isPublished: song.isPublished,
       isRecommended: song.isRecommended, albumId: song.albumId,
     })
     setModalOpen(true)
   }
 
   const handleSave = async () => {
     if (!form.title) { alert('请输入歌曲名称'); return }
     setSaving(true)
     try {
       const payload = {
         title: form.title, artist: form.artist, genre: form.genre || '原创',
         audioUrl: form.audioUrl, coverUrl: form.coverUrl || null,
         description: form.description || null, lyrics: form.lyrics || null,
         duration: form.duration || 0, isPublished: form.isPublished,
         isRecommended: form.isRecommended, albumId: form.albumId || null,
       }
       if (editingId) {
         await fetch(`/api/songs/${editingId}`, {
           method: 'PUT', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         })
       } else {
         await fetch('/api/songs', {
           method: 'POST', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...payload, isPublished: true }),
         })
       }
       await loadSongs()
       setModalOpen(false)
       setForm(emptySong())
       setEditingId(null)
     } catch (e: any) { alert('操作失败: ' + e.message) }
     setSaving(false)
   }
 
   const togglePublish = async (id: number, val: boolean) => {
     await fetch(`/api/songs/${id}`, {
       method: 'PUT', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ isPublished: val }),
     })
     setSongs(s => s.map(sg => sg.id === id ? { ...sg, isPublished: val } : sg))
   }
 
   const toggleRecommend = async (id: number, val: boolean) => {
     await fetch(`/api/songs/${id}`, {
       method: 'PUT', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ isRecommended: val }),
     })
     setSongs(s => s.map(sg => sg.id === id ? { ...sg, isRecommended: val } : sg))
   }
 
   const deleteSong = async (id: number) => {
     if (!confirm('确定删除此歌曲？')) return
     await fetch(`/api/songs/${id}`, { method: 'DELETE' })
     setSongs(s => s.filter(sg => sg.id !== id))
   }
 
   const formatDur = (s: number) =>
     s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '--:--'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gradient">单曲管理</h1>
           <p className="text-gray-500 text-sm mt-1">管理所有音乐作品</p>
        </div>
        <button
           onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          新建歌曲
        </button>
      </div>

       <div className="rounded-xl glass overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-white/5">
                 <th className="text-left p-3 text-xs text-gray-500 font-medium">歌曲</th>
                 <th className="text-left p-3 text-xs text-gray-500 font-medium hidden sm:table-cell">艺术家</th>
                 <th className="text-left p-3 text-xs text-gray-500 font-medium hidden md:table-cell">时长</th>
                 <th className="text-left p-3 text-xs text-gray-500 font-medium hidden lg:table-cell">播放</th>
                 <th className="text-left p-3 text-xs text-gray-500 font-medium">推荐</th>
                 <th className="text-left p-3 text-xs text-gray-500 font-medium">发布</th>
                 <th className="text-right p-3 text-xs text-gray-500 font-medium">操作</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                 <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-600">加载中...</td></tr>
               ) : songs.length === 0 ? (
                 <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-600">暂无歌曲，点击上方按钮创建</td></tr>
               ) : (
                 songs.map((song, i) => (
                   <motion.tr key={song.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                     className="border-b border-white/5 hover:bg-white/5 transition-colors">
                     <td className="p-3">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                           {song.coverUrl ? <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                             : <Music size={16} className="text-gray-600" />}
                         </div>
                         <div className="min-w-0">
                           <p className="text-sm text-white truncate max-w-[160px]">{song.title}</p>
                           {song.album && <p className="text-[10px] text-gray-600 truncate">{song.album.title}</p>}
                         </div>
                       </div>
                     </td>
                     <td className="p-3 text-xs text-gray-400 hidden sm:table-cell">{song.artist}</td>
                     <td className="p-3 text-xs text-gray-500 hidden md:table-cell tabular-nums">{formatDur(song.duration)}</td>
                     <td className="p-3 text-xs text-gray-500 hidden lg:table-cell tabular-nums">{song.playCount}</td>
                     <td className="p-3">
                       <button onClick={() => toggleRecommend(song.id, !song.isRecommended)}
                         className={`p-1 rounded transition-colors ${
                           song.isRecommended ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
                         }`} title={song.isRecommended ? '取消推荐' : '推荐到前台'}>
                         <Star size={14} fill={song.isRecommended ? 'currentColor' : 'none'} />
                       </button>
                     </td>
                     <td className="p-3">
                       <button onClick={() => togglePublish(song.id, !song.isPublished)}
                         className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                           song.isPublished
                             ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                             : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                         }`}>
                         {song.isPublished ? '已发布' : '未发布'}
                       </button>
                     </td>
                     <td className="p-3">
                       <div className="flex items-center justify-end gap-1">
                         <button onClick={() => openEdit(song)}
                           className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                           <Edit2 size={13} />
                         </button>
                         <button onClick={() => deleteSong(song.id)}
                           className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                           <Trash2 size={13} />
                         </button>
                       </div>
                     </td>
                   </motion.tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       </div>

       {/* Create/Edit Modal */}
       <AnimatePresence>
         {modalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setModalOpen(false)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 rounded-xl glass border border-white/10"
               onClick={e => e.stopPropagation()}>
 
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-base font-semibold text-white">{editingId ? '编辑歌曲' : '新建歌曲'}</h2>
                 <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                   <X size={18} />
                 </button>
               </div>
 
               <div className="space-y-4">
                 {/* Cover + Audio uploads */}
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="text-[10px] text-gray-500 block mb-1">封面图片</label>
                     <div className="flex items-center gap-3">
                       <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                         {form.coverUrl ? <img src={form.coverUrl} className="w-full h-full object-cover" alt="" />
                           : <Music size={20} className="text-gray-600" />}
                       </div>
                       <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}
                         className="text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-white/10 file:text-white" />
                     </div>
                   </div>
                   <div className="flex-1">
                     <label className="text-[10px] text-gray-500 block mb-1">音频文件</label>
                     <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/10 text-xs text-gray-400 cursor-pointer hover:bg-white/10 truncate">
                       <Upload size={14} />{audioUploading ? '上传中...' : form.audioUrl ? '已选择音频' : '选择音频文件'}
                       <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(f) }} />
                     </label>
                     {form.audioUrl && <p className="text-[10px] text-gray-600 mt-1 truncate">{form.audioUrl.split('/').pop()}</p>}
                   </div>
                 </div>
 
                 {/* Title + Artist */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="col-span-2">
                     <label className="text-[10px] text-gray-500 block mb-1">歌曲名称 *</label>
                     <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                       className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />
                   </div>
                   <div>
                     <label className="text-[10px] text-gray-500 block mb-1">艺术家</label>
                     <input value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                       className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" />
                   </div>
                   <div>
                     <label className="text-[10px] text-gray-500 block mb-1">类型</label>
                     <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                       className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 appearance-none">
                       <option value="原创">原创</option>
                       <option value="流行">流行</option>
                       <option value="民谣">民谣</option>
                       <option value="摇滚">摇滚</option>
                       <option value="电子">电子</option>
                       <option value="古典">古典</option>
                       <option value="其他">其他</option>
                     </select>
                   </div>
                 </div>
 
                 {/* Album selection */}
                 <div>
                   <label className="text-[10px] text-gray-500 block mb-1">所属专辑</label>
                   <select value={form.albumId ?? ''} onChange={e => setForm(f => ({ ...f, albumId: e.target.value ? Number(e.target.value) : null }))}
                     className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 appearance-none">
                     <option value="">无专辑</option>
                     {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                   </select>
                 </div>
 
                 {/* Description */}
                 <div>
                   <label className="text-[10px] text-gray-500 block mb-1">歌曲说明</label>
                   <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                     rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" />
                 </div>
 
                 {/* Lyrics */}
                 <div>
                   <label className="text-[10px] text-gray-500 block mb-1">歌词（支持时间轴格式）</label>
                   <textarea value={form.lyrics} onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))}
                     rows={4} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none font-mono text-xs" placeholder="[00:00.000]歌词内容" />
                 </div>
 
                 {/* Toggles */}
                 <div className="flex items-center gap-6">
                   <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                     <input type="checkbox" checked={form.isPublished}
                       onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                       className="accent-accent-purple" />
                     已发布
                   </label>
                   <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                     <input type="checkbox" checked={form.isRecommended}
                       onChange={e => setForm(f => ({ ...f, isRecommended: e.target.checked }))}
                       className="accent-yellow-500" />
                     推荐到前台
                   </label>
                 </div>
 
                 {/* Save button */}
                 <div className="flex gap-3 pt-2">
                   <button onClick={handleSave} disabled={saving || !form.audioUrl}
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all">
                     <Save size={16} />{saving ? '保存中...' : '保存'}
                   </button>
                   <button onClick={() => setModalOpen(false)}
                     className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-all">
                     取消
                   </button>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  )
}
