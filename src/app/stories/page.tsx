'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BookOpen, Calendar, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Story } from '@/types'

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stories')
      .then(r => r.json())
      .then(d => {
        if (d.success) setStories(d.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-[1770px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-accent-purple" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="text-gradient">音乐故事</span>
            </h1>
          </div>
          <p className="text-gray-500 text-lg">
            每首歌曲背后，都有一段属于它的故事
          </p>
        </motion.div>

        {/* Stories list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-gray-600 animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">还没有故事</p>
            <p className="text-gray-600 text-sm">等审核通过的故事展示在这里</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <motion.article
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link href={`/stories/${story.id}`}>
                <div className="group p-8 rounded-2xl glass glass-hover h-full">
                  {/* Image placeholder */}
                  {story.imageUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-white/5">
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl mb-6 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-blue/10 flex items-center justify-center">
                      <BookOpen size={48} className="text-accent-purple/30" />
                    </div>
                  )}

                  <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-accent-purple transition-colors">
                    {story.title}
                  </h2>

                  <p className="text-sm text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                    {story.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {story.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(story.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
          </div>
        )}

        {/* Submit CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16 p-12 rounded-2xl glass"
        >
          <h3 className="text-2xl font-bold mb-4">
            分享你的{' '}
            <span className="text-gradient">音乐故事</span>
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            如果你也有与音乐相关的故事，欢迎投稿分享
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all"
          >
            <BookOpen size={18} />
            我要投稿
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
