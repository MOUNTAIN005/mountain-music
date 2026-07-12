'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Send, Github, Twitter } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-[1770px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">联系我们</span>
          </h1>
          <p className="text-gray-500 text-lg">
            期待听到你的声音
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="p-8 rounded-2xl glass">
              <h3 className="text-lg font-semibold mb-6">联系方式</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">邮箱</p>
                    <p className="text-sm text-white">hello@mountainmusic.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">位置</p>
                    <p className="text-sm text-white">中国 · 杭州</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl glass">
              <h3 className="text-lg font-semibold mb-6">社交媒体</h3>
              <div className="flex gap-4">
                {[
                  { icon: Github, label: 'GitHub' },
                  { icon: Twitter, label: 'Twitter' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-14 h-14 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-accent-purple hover:border-accent-purple/30 transition-all"
                  >
                    <social.icon size={24} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {submitted ? (
              <div className="p-12 rounded-2xl glass text-center">
                <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-accent-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">消息已发送</h3>
                <p className="text-gray-400">感谢你的留言，我会尽快回复</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl glass space-y-6">
                <h3 className="text-lg font-semibold mb-2">发送消息</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">姓名</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                      placeholder="你的名字"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">主题</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
                    placeholder="消息主题"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">消息</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all resize-none"
                    placeholder="写下你想说的话..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all"
                >
                  <Send size={18} />
                  发送消息
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
