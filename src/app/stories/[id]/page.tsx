'use client'

import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { notFound, useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

const mockStories = [
  {
    id: 1,
    title: '《萤火》——黑夜中的微光',
    author: '山影知道',
    content: '这首歌写于一个失眠的深夜。那时我独自坐在窗前，看着远处零星的路灯，想起了小时候在乡下看到的萤火虫。\n\n那些微小的光亮，虽然不足以照亮整个世界，但足以温暖一个人的心。\n\n我想，每个人的生命中都有这样的时刻——觉得自己渺小如萤火，但也正是这些微光，汇聚成了我们继续前行的力量。',
    imageUrl: null,
    createdAt: '2024-06-15',
  },
  {
    id: 2,
    title: '《边缘》——在梦与醒之间',
    author: '山影知道',
    content: '边缘，是一个很特别的位置。\n\n它既不属于这边，也不属于那边。就像半梦半醒之间，你能感受到两个世界的气息。\n\n这首歌想要表达的，就是这种游离的状态。在现实与理想之间，在喧嚣与宁静之间，在坚持与放弃之间...\n\n每一个选择，都让我们站在新的边缘。',
    imageUrl: null,
    createdAt: '2024-07-01',
  },
]

export default function StoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const story = mockStories.find((s) => s.id === Number(params.id))

  if (!story) return notFound()

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          返回
        </button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {story.imageUrl ? (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-white/5">
              <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video rounded-2xl mb-8 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-blue/10" />
          )}

          <h1 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="text-gradient">{story.title}</span>
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-white/5">
            <span className="flex items-center gap-1">
              <User size={14} />
              {story.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(story.createdAt)}
            </span>
          </div>

          <div className="prose prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-gray-300 leading-relaxed mb-6 text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  )
}
