'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Quote, Sparkles, X, Clock, ChevronDown, ChevronUp, BookOpen, Play, Pause } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

interface StoryData {
  id: number
  title: string
  author: string
  content: string
  songTitle?: string | null
  song?: { audioUrl?: string; title?: string } | null
  lyrics?: string | null
  createdAt: string
}

export default function StoriesSection() {
  const [stories, setStories] = useState<StoryData[]>([])
  const { play, currentSong, isPlaying, pause, resume, currentTime } = useAudioPlayer()
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', title: '', content: '' })
  const sectionRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/stories')
      .then(r => r.json())
      .then(d => { if (d.success) setStories(d.data || []) })
      .finally(() => setLoaded(true))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.title || !formData.content) return
    setSubmitting(true)
    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
      setFormData({ name: '', email: '', title: '', content: '' })
      setTimeout(() => { setSubmitted(false); setShowForm(false); setFormOpen(false) }, 3000)
    } catch {}
    setSubmitting(false)
  }

  const isCurrentSong = (story: any) => currentSong?.id === -(1000 + story.id)

  const playStorySong = (story: any) => {
    if (isCurrentSong(story) && isPlaying) { pause(); return }
    if (isCurrentSong(story) && !isPlaying) { resume(); return }
    play({
      id: -(1000 + story.id),
      title: story.songTitle || story.title,
      artist: story.author || '山影知道',
      coverUrl: null,
      audioUrl: story.song?.audioUrl || '',
      lyrics: story.lyrics || '',
      description: null,
      genre: null,
      duration: 0,
      playCount: 0,
      likeCount: 0,
      sortOrder: 0,
      isPublished: true,
      albumId: null,
      createdAt: '',
      updatedAt: '',
    })
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}`
  }

  // Mouse tracking for button interactive effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
    })
  }

  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-purple/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1770px] mx-auto px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
            让旋律诠释你的故事
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-accent-purple to-accent-blue mx-auto rounded-full" />
        </motion.div>

        {/* Interactive Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <button
            ref={btnRef}
            onClick={() => { setShowForm(!showForm); setFormOpen(!formOpen) }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            className="group relative px-10 py-4 rounded-full text-white font-medium text-lg overflow-hidden transition-all duration-300"
            style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
          >
            {/* Animated gradient background */}
            <span className="absolute inset-0 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-purple bg-[length:200%_100%] animate-gradient-x" />
            
            {/* Glow effect */}
            <span className="absolute -inset-1 bg-gradient-to-r from-accent-purple/50 via-accent-blue/50 to-accent-purple/50 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            
            {/* Sparkle particles */}
            <span className="absolute top-2 left-4 text-white/30 text-[8px] animate-pulse">✦</span>
            <span className="absolute bottom-3 right-6 text-white/20 text-[6px] animate-pulse delay-500">✦</span>
            
            {/* Content */}
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              <span>分享你的故事</span>
              <ChevronDown size={18} className={`transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`} />
            </span>
          </button>
        </motion.div>

        {/* Submission Form - Animated slide down */}
              <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-16 max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl"
              >
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <p className="text-white font-medium text-lg mb-1">投稿成功！🎉</p>
                    <p className="text-gray-500 text-sm">审核通过后将在页面展示</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">你的名字</label>
                        <input type="text" required value={formData.name}
                          onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                          placeholder="怎么称呼你？" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">邮箱</label>
                        <input type="email" value={formData.email}
                          onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">故事标题</label>
                      <input type="text" required value={formData.title}
                        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                        placeholder="给你的故事取个名字" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">故事内容</label>
                      <textarea required rows={5} value={formData.content}
                        onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all resize-none"
                        placeholder="写下你的音乐故事..." />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50">
                      <Send size={16} />{submitting ? '提交中...' : '提交故事'}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Stories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Loading skeleton */}
          {!loaded && Array.from({ length: 2 }).map((_, i) => (
            <div key={`sk-st-${i}`} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 aspect-[4/3]">
              <div className="flex items-start gap-4">
                <div className="hidden sm:block w-10 h-10 rounded-full skeleton-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 skeleton-pulse rounded" />
                  <div className="h-3 w-1/3 skeleton-pulse rounded" />
                  <div className="h-4 w-full skeleton-pulse rounded" />
                  <div className="h-4 w-2/3 skeleton-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
          {loaded && stories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpen size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-1">还没有故事</p>
              <p className="text-gray-700 text-xs">来分享第一个吧 ✨</p>
            </motion.div>
          )}
          <AnimatePresence>
            {loaded && stories.slice(0, 4).map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 0.5) }}
                className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-lg hover:shadow-accent-purple/[0.05] hover:-translate-y-0.5 transition-all duration-300 aspect-[4/3] flex flex-col"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-accent-purple to-accent-blue opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start gap-4 flex-1">
                  {/* Quote icon */}
                  <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple/25 to-accent-blue/25 items-center justify-center shrink-0 mt-0.5 group-hover:from-accent-purple/40 group-hover:to-accent-blue/40 transition-all duration-300">
                    <Quote size={12} className="text-accent-purple/70 group-hover:text-accent-purple transition-colors duration-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-purple group-hover:to-accent-blue transition-all duration-300">
                      {story.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500">
                      <span className="text-gray-400">{story.author}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(story.createdAt)}</span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                      {story.content}
                    </p>
                  </div>
                </div>
                  {/* Play button + song info */}
          {story.songTitle && (
                    <div className="mt-auto pt-3 border-t border-white/5 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); playStorySong(story) }}
                          className="w-7 h-7 rounded-full bg-accent-purple/80 flex items-center justify-center shrink-0 hover:bg-accent-purple hover:shadow-lg hover:shadow-accent-purple/20 transition-all"
                        >
                          {isCurrentSong(story) && isPlaying ? (
                            <Pause size={11} className="text-white" />
                          ) : (
                            <Play size={11} className="text-white ml-0.5" />
                          )}
                        </button>
                        <span className="text-[11px] text-gray-300 truncate flex-1 min-w-0 font-medium">{story.songTitle}</span>
                      </div>
                      {story.lyrics && (
                        <p className="text-[10px] text-gray-500 truncate pl-9">
                          {(() => {
                            const firstLine = story.lyrics?.split('\n')[0] || '';
                            return firstLine.replace(/^\[\d+:\d+[\.\d]*\]\s*/, '');
                          })()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
