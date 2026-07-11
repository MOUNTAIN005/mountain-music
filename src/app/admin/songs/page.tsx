'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Music, Play } from 'lucide-react'

const mockSongs = [
  { id: 1, title: '萤火', artist: '山影知道', genre: '流行', duration: 240, playCount: 1280, isPublished: true },
  { id: 2, title: '边缘', artist: '山影知道', genre: '民谣', duration: 210, playCount: 960, isPublished: true },
  { id: 3, title: '风要怎么停息', artist: '山影知道', genre: '流行', duration: 195, playCount: 2340, isPublished: true },
  { id: 4, title: '我做了个梦', artist: '山影知道', genre: '民谣', duration: 225, playCount: 1876, isPublished: true },
]

export default function AdminSongsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gradient">单曲管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理你的音乐作品</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          新增歌曲
        </button>
      </div>

      {/* Songs table */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">歌曲</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">艺术家</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden sm:table-cell">类型</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden md:table-cell">时长</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden md:table-cell">播放</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">状态</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {mockSongs.map((song, i) => (
                <motion.tr
                  key={song.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Music size={18} className="text-gray-500" />
                      </div>
                      <span className="text-sm text-white">{song.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{song.artist}</td>
                  <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">{song.genre}</td>
                  <td className="p-4 text-sm text-gray-400 hidden md:table-cell tabular-nums">
                    {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                  </td>
                  <td className="p-4 text-sm text-gray-400 hidden md:table-cell">{song.playCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      song.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {song.isPublished ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg p-8 rounded-2xl glass" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">新增歌曲</h2>
            <p className="text-gray-400 text-sm">完整的歌曲管理功能将在数据库连接后启用。</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-6 px-4 py-2 rounded-xl bg-white/10 text-white text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
