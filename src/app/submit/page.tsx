'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Upload, CheckCircle, Loader2 } from 'lucide-react'
import UploadField from '@/components/UploadField'

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const r = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl: imageUrl || null }),
      })
      const d = await r.json()
      if (d.success) {
        setSubmitted(true)
      } else {
        setError(d.error || '投稿失败，请重试')
      }
    } catch {
      setError('投稿失败，请检查网络连接')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-accent-purple mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">投稿成功！</h2>
          <p className="text-gray-400">
            感谢你的分享，审核通过后将会展示在音乐故事页面。
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">投稿</span>
          </h1>
          <p className="text-gray-500 text-lg">
            分享你的音乐故事
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">姓名</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all"
                placeholder="你的名字"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">邮箱</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">故事标题</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all"
              placeholder="故事的标题"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">故事内容</label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all resize-none"
              placeholder="写下你的音乐故事..."
            />
          </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">故事配图</label>
          <UploadField
            accept="image/*"
            label="选择图片"
            onUpload={(url) => setImageUrl(url)}
            currentUrl={imageUrl}
            uploadContext="submit"
            preview
          />
          <p className="text-[10px] text-gray-500 mt-1.5">
            建议 16:9 比例，宽度 1200px，大小 700KB 以内
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> 提交中...</>
            ) : (
              <><Send size={18} /> 提交投稿</>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
