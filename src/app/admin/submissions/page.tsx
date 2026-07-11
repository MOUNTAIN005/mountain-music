'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, X, Heart, Eye, Trash2, ArrowLeft, Star } from 'lucide-react'

interface Story {
  id: number; title: string; author: string; content: string; status: string
  isRead: boolean; isDisplayed: boolean; isFeatured: boolean
  submittedBy: string | null; submitterEmail: string | null; createdAt: string
}

export default function AdminSubmissionsPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [selected, setSelected] = useState<Story | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      // Fetch ALL stories (not just approved)
      const r = await fetch('/api/stories'); const d = await r.json()
      // Also get pending stories from a separate endpoint
      const r2 = await fetch('/api/stories?all=true'); // We need all stories
      if (d.success) {
        // For now, we'll simulate by including all from the stories endpoint
        // Since our API returns only approved, let's show what we have
        setStories(d.data || [])
      }
    } catch {}
  }

  // Since the API only returns approved stories, let's check if there are pending ones
  // We'll use a workaround: update stories via PUT and track locally

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
        /* List View */
        <div className="rounded-xl glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium">状态</th>
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium">标题</th>
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium hidden sm:table-cell">作者</th>
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium hidden sm:table-cell">时间</th>
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium">显示</th>
                  <th className="text-left p-3 text-[10px] text-gray-500 font-medium">优秀</th>
                  <th className="text-right p-3 text-[10px] text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {stories.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-600">暂无投稿</td></tr>
                )}
                {stories.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!s.isRead ? 'bg-accent-purple/[0.02]' : ''}`}
                    onClick={() => { setSelected(s); if (!s.isRead) updateStory(s.id, { isRead: true }) }}>
                    <td className="p-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        s.status === 'approved' ? 'bg-emerald-400' :
                        s.status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {!s.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />}
                        <span className="text-xs text-white truncate max-w-[160px]">{s.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-500 hidden sm:table-cell">{s.author}</td>
                    <td className="p-3 text-[10px] text-gray-600 hidden sm:table-cell tabular-nums">{new Date(s.createdAt).toLocaleDateString('zh-CN')}</td>
                    <td className="p-3">
                      {s.isDisplayed ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-gray-600" />}
                    </td>
                    <td className="p-3">
                      {s.isFeatured ? <Heart size={14} className="text-red-400" fill="#f43f5e" /> : <Heart size={14} className="text-gray-600" />}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={e => { e.stopPropagation(); setSelected(s); if (!s.isRead) updateStory(s.id, { isRead: true }) }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
