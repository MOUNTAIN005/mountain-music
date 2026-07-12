'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, X, Heart, Eye, Trash2, ArrowLeft, Star, BookOpen, Save, CheckCircle } from 'lucide-react'
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

export default function AdminSubmissionsPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [selected, setSelected] = useState<Story | null>(null)
  const [allSongs, setAllSongs] = useState<any[]>([])
  const [showToast, setShowToast] = useState(false)
  const [songEdit, setSongEdit] = useState({ songId: null as number | null, songTitle: '', lyrics: '' })

  useEffect(() => { load(); fetch('/api/songs').then(r => r.json()).then(d => { if (d.success) setAllSongs(d.data || []) }).catch(() => {}) }, [])

  useEffect(() => {
    if (selected) setSongEdit({ songId: selected.songId ?? null, songTitle: selected.songTitle || '', lyrics: selected.lyrics || '' })
  }, [selected])

  const load = async () => {
    try {
       const r = await fetch('/api/stories?all=true'); const d = await r.json()
       if (d.success) setStories(d.data || [])
    } catch {}
  }
  const updateStory = async (id: number, data: Partial<Story>) => {
    try {
      await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setStories(s => s.map(st => st.id === id ? { ...st, ...data } : st))
      if (selected?.id === id) setSelected(s => s ? { ...s, ...data } : null)
    } catch {}
  }

  const unreadCount = stories.filter(s => !s.isRead).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gradient">审核投稿</h1>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs tabular-nums">
            {unreadCount} 条未读
          </span>
        )}
      </div>

      {selected ? (
        /* Detail View */
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs mb-5">
            <ArrowLeft size={14} /> 返回列表
          </button>

          <div className="max-w-2xl p-6 rounded-xl glass space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{selected.title}</h2>
                <p className="text-xs text-gray-500 mt-1">作者: {selected.author}{selected.submitterEmail ? ` · ${selected.submitterEmail}` : ''}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">投稿时间: {new Date(selected.createdAt).toLocaleDateString('zh-CN')}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                selected.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                selected.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                {selected.status === 'approved' ? '已通过' : selected.status === 'rejected' ? '已拒绝' : '待审核'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            </div>

            {/* Story image */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">故事配图</h3>
              <UploadField
                accept="image/*"
                label={selected.imageUrl ? '更换图片' : '选择图片'}
                onUpload={(url) => {
                  updateStory(selected.id, { imageUrl: url });
                  setSelected(s => s ? { ...s, imageUrl: url } : null);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                currentUrl={selected.imageUrl || ''}
                oldFileUrl={selected.imageUrl || ''}
                preview
              />
              <p className="text-[10px] text-gray-600 mt-1">
                建议 16:9 比例，宽度 1200px，500KB 以内
              </p>
            </div>

            {/* Song information */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">关联歌曲</h3>
              <select value={songEdit.songId ?? ''} onChange={e => {
                const sid = e.target.value ? Number(e.target.value) : null;
                const song = sid ? allSongs.find(s => s.id === sid) : null;
                setSongEdit(f => ({ ...f, songId: sid, songTitle: song?.title || '', lyrics: song?.lyrics || '' }));
              }} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 appearance-none">
                <option value="">无关联歌曲</option>
                {allSongs.map(s => <option key={s.id} value={s.id}>{s.album?.title ? s.album.title + ' - ' : ''}{s.title}</option>)}
              </select>
              <input value={songEdit.songTitle || ''} onChange={e => {
                setSongEdit(f => ({ ...f, songTitle: e.target.value }));
              }} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50" placeholder="歌曲名称" />

              {/* Save button */}
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  updateStory(selected.id, songEdit);
                  setSelected(s => s ? { ...s, ...songEdit } : null);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-medium hover:shadow-lg transition-all">
                  <Save size={14} />保存歌曲信息
                </button>
                {showToast && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px]">
                    <CheckCircle size={12} />保存成功
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Mark as read */}
              <button onClick={() => updateStory(selected.id, { isRead: !selected.isRead })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${selected.isRead ? 'bg-white/5 text-gray-500' : 'bg-accent-purple/15 text-accent-purple'}`}>
                <Mail size={14} />{selected.isRead ? '已读' : '标记已读'}
              </button>

              {/* Display toggle */}
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${selected.isDisplayed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                <input type="checkbox" checked={selected.isDisplayed} onChange={e => updateStory(selected.id, { isDisplayed: e.target.checked })} className="sr-only" />
                <Check size={14} />
                {selected.isDisplayed ? '前台显示' : '不显示'}
              </label>

              {/* Featured heart */}
              <button onClick={() => updateStory(selected.id, { isFeatured: !selected.isFeatured })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${selected.isFeatured ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                <Heart size={14} fill={selected.isFeatured ? '#f43f5e' : 'none'} />{selected.isFeatured ? '已标为优秀' : '标为优秀'}
              </button>

              {/* Approve / Reject */}
              {selected.status === 'pending' && (
                <>
                  <button onClick={() => updateStory(selected.id, { status: 'approved' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-colors">
                    <Check size={14} />通过
                  </button>
                  <button onClick={() => updateStory(selected.id, { status: 'rejected' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs hover:bg-red-500/25 transition-colors">
                    <X size={14} />拒绝
                  </button>
                </>
              )}

              {/* Delete */}
              <button onClick={async () => {
                if (confirm('确定删除此投稿？')) {
                  await fetch(`/api/stories/${selected.id}`, { method: 'DELETE' })
                  setStories(s => s.filter(st => st.id !== selected.id))
                  setSelected(null)
                }
              }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-500 text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors ml-auto">
                <Trash2 size={14} />删除
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Card Grid */
        <>
          {stories.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">暂无投稿</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stories.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`group relative p-4 rounded-xl glass border transition-all duration-300 cursor-pointer ${!s.isRead ? 'border-accent-purple/20 bg-accent-purple/[0.03] hover:border-accent-purple/30' : 'border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-accent-purple/[0.02]'}`}
                onClick={() => { setSelected(s); if (!s.isRead) updateStory(s.id, { isRead: true }) }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${s.status === 'approved' ? 'bg-emerald-400' : s.status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    {!s.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelected(s); if (!s.isRead) updateStory(s.id, { isRead: true }) }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Eye size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5 truncate">{s.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                  <span>{s.author}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>{new Date(s.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">
                  {s.content}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  {s.isDisplayed && <span className="flex items-center gap-1"><Check size={10} className="text-emerald-400" />显示</span>}
                  {s.isFeatured && <span className="flex items-center gap-1"><Heart size={10} className="text-red-400" fill="#f43f5e" />优秀</span>}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] border ${s.status === 'approved' ? 'border-emerald-500/20 text-emerald-400' : s.status === 'rejected' ? 'border-red-500/20 text-red-400' : 'border-amber-500/20 text-amber-400'}`}>
                    {s.status === 'approved' ? '通过' : s.status === 'rejected' ? '拒绝' : '待审'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
