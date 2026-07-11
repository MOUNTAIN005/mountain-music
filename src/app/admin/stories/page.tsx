'use client'

import { motion } from 'framer-motion'
import { Check, X, Eye } from 'lucide-react'

const mockStories = [
  { id: 1, title: '《萤火》——黑夜中的微光', author: '山影知道', status: 'approved', date: '2024-06-15' },
  { id: 2, title: '《边缘》——在梦与醒之间', author: '山影知道', status: 'approved', date: '2024-07-01' },
]

export default function AdminStoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">故事投稿管理</h1>
        <p className="text-gray-500 text-sm mt-1">审核和管理用户投稿</p>
      </div>

      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">标题</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">作者</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden sm:table-cell">投稿时间</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">状态</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {mockStories.map((story, i) => (
                <motion.tr
                  key={story.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white">{story.title}</td>
                  <td className="p-4 text-sm text-gray-400">{story.author}</td>
                  <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">{story.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      story.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : story.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {story.status === 'approved' ? '已通过' : story.status === 'pending' ? '待审核' : '已拒绝'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-colors">
                        <Check size={14} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
