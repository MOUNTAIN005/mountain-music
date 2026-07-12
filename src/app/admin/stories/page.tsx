'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Edit3, Trash2, Heart, Eye, EyeOff, Star, Save, BookOpen, CheckCircle } from 'lucide-react'
import UploadField from '@/components/UploadField'

interface Story {
  id: number; title: string; author: string; content: string; status: string
  isRead: boolean; isDisplayed: boolean; isFeatured: boolean
  imageUrl?: string | null
  songId?: number | null
  songTitle?: string | null
  lyrics?: string | null
  submittedBy: string | null; submitterEmail: string | null; createdAt: string
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Story | null>(null)
  const [allSongs, setAllSongs] = useState<any[]>([])
  const [editForm, setEditForm] = useState({ title: '', author: '', content: '', songTitle: '', songId: null as number | null, lyrics: '' })
  const [editImageUrl, setEditImageUrl] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const r = await fetch('/api/stories?all=true'); const d = await r.json()
      if (d.success) setStories(d.data || [])
    } catch {} finally { setLoading(false) }
  }

  const updateStory = async (id: number, data: Partial<Story>) => {
    try {
      await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setStories(s => s.map(st => st.id === id ? { ...st, ...data } : st))
    } catch {}
  }

  const openEdit = (story: Story) => {
    setEditing(story)
    setEditForm({ title: story.title, author: story.author, content: story.content, songTitle: story.songTitle || '', songId: story.songId ?? null, lyrics: story.lyrics || '' })
    setEditImageUrl(story.imageUrl || '')
  }

  const saveEdit = async () => {
    if (!editing) return
    await updateStory(editing.id, { ...editForm, imageUrl: editImageUrl || null } as any)
    setEditing(null)
  }

  const deleteStory = async (id: number) => {
    if (!confirm('确定删除此故事？')) return
    await fetch(`/api/stories/${id}`, { method: 'DELETE' })
    setStories(s => s.filter(st => st.id !== id))
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
      pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    }
    const label: Record<string, string> = { approved: '已通过', rejected: '已拒绝', pending: '待审核' }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${map[status] || map.pending}`}>
        {label[status] || status}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gradient">故事投稿管理</h1>
        <span className="text-xs text-gray-500">共 {stories.length} 篇</span>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="p-5 rounded-xl glass border border-white/5 space-y-3">
              <div className="h-4 w-1/3 skeleton-pulse rounded" />
              <div className="h-5 w-3/4 skeleton-pulse rounded" />
              <div className="h-3 w-1/2 skeleton-pulse rounded" />
              <div className="h-4 w-full skeleton-pulse rounded" />
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">暂无故事投稿</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="group relative p-5 rounded-xl glass border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-accent-purple/[0.03] transition-all duration-300"
            >
              {/* Top row: status + actions */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {statusBadge(story.status)}
                  {story.isFeatured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(story)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-accent-purple transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => updateStory(story.id, { isFeatured: !story.isFeatured })}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${story.isFeatured ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}>
                    <Star size={14} fill={story.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => updateStory(story.id, { isDisplayed: !story.isDisplayed })}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${story.isDisplayed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}>
                    {story.isDisplayed ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => deleteStory(story.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{story.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                <span>{story.author}</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>{new Date(story.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {story.content}
              </p>

              {/* Bottom actions (visible on hover) */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                {story.status === 'pending' && (
                  <>
                    <button onClick={() => updateStory(story.id, { status: 'approved' })}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] hover:bg-emerald-500/20 transition-colors">
                      <Check size={12} />通过
                    </button>
                    <button onClick={() => updateStory(story.id, { status: 'rejected' })}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-[10px] hover:bg-red-500/20 transition-colors">
                      <X size={12} />拒绝
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-xl glass border border-white/10" onClick={e => e.stopPropagation()}>

              <h2 className="text-base font-semibold text-white mb-4">编辑故事</h2>

              <div className="space-y-4">
                {/* Image upload */}
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">故事配图</label>
                  <UploadField
                    accept="image/*"
                    label="选择图片"
                    onUpload={(url) => setEditImageUrl(url)}
                    currentUrl={editImageUrl}
                    oldFileUrl={editImageUrl}
                    preview
                  />
                  <p className="text-[10px] text-gray-600 mt-1">
                    建议 16:9 比例，宽度 1200px，500KB 以内
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">标题</label>
                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">作者</label>
                  <input value={editForm.author} onChange={e => setEditForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">内容</label>
                  <textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    rows={6} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none" />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">关联歌曲</label>
                  <select value={editForm.songId ?? ''} onChange={e => {
                    const sid = e.target.value ? Number(e.target.value) : null
                    const song = sid ? allSongs.find(s => s.id === sid) : null
                    setEditForm(f => ({ ...f, songId: sid, songTitle: song?.title || '', lyrics: song?.lyrics || '' }))
                  }} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 appearance-none">
                    <option value="">无关联歌曲</option>
                    {allSongs.map(s => <option key={s.id} value={s.id}>{s.album?.title ? s.album.title + ' - ' : ''}{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">歌曲名称</label>
                  <input value={editForm.songTitle} onChange={e => setEditForm(f => ({ ...f, songTitle: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="留空则用关联歌曲名称" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg transition-all">
                    <Save size={16} />保存
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-all">
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
