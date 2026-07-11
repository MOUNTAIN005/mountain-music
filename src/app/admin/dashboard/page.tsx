'use client'

import { motion } from 'framer-motion'
import { Music, Disc3, BookOpen, Headphones } from 'lucide-react'

const stats = [
  { label: '歌曲数量', value: '6', icon: Music, color: 'from-accent-purple to-accent-blue' },
  { label: '专辑数量', value: '1', icon: Disc3, color: 'from-accent-blue to-accent-cyan' },
  { label: '故事数量', value: '2', icon: BookOpen, color: 'from-accent-cyan to-emerald-400' },
  { label: '总播放次数', value: '8,915', icon: Headphones, color: 'from-amber-400 to-orange-500' },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">仪表盘</h1>
        <p className="text-gray-500 text-sm mt-1">欢迎回来，山影知道</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="p-6 rounded-2xl glass"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
            >
              <stat.icon size={22} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: '添加新歌曲', desc: '上传音乐文件' },
            { label: '创建专辑', desc: '整理音乐作品' },
            { label: '审核投稿', desc: '管理用户投稿' },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="p-6 rounded-2xl glass glass-hover cursor-pointer"
            >
              <h3 className="font-medium text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
