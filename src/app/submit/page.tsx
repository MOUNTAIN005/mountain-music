'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Upload, CheckCircle } from 'lucide-react'

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    content: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API call
    setSubmitted(true)
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
            <label className="block text-sm text-gray-400 mb-2">附件上传</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-accent-purple/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                点击上传图片或文档
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all"
          >
            <Send size={18} />
            提交投稿
          </button>
        </motion.form>
      </div>
    </div>
  )
}
