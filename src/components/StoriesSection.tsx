'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Quote, Sparkles, X, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface StoryData {
  id: number
  title: string
  author: string
  content: string
  createdAt: string
}

export default function StoriesSection() {
  const [stories, setStories] = useState<StoryData[]>([])
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

      <div className="relative max-w-[1700px] mx-auto px-6">
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
        <div className="space-y-5">
          {stories.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-gray-600 text-sm"
            >还没有故事，来分享第一个吧 ✨</motion.p>
          )}
          <AnimatePresence>
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 0.5) }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  {/* Quote icon */}
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 items-center justify-center shrink-0 mt-1">
                    <Quote size={18} className="text-accent-purple/60" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-purple group-hover:to-accent-blue transition-all duration-300">
                      {story.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3 text-[11px] text-gray-500">
                      <span className="text-gray-400">{story.author}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(story.createdAt)}</span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                      {story.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
