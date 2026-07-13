'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Play, Music } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '', '', '', '', '', '', '']
const rankBgColors = ['rgba(255,215,0,0.1)', 'rgba(192,192,192,0.1)', 'rgba(205,127,50,0.1)', '', '', '', '', '', '', '']

const apiFileUrl = (url: string) => url?.startsWith("/uploads/") ? url.replace("/uploads/", "/api/uploads/") : url

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { play, setPlaylist, currentSong, isPlaying } = useAudioPlayer()

  useEffect(() => {
    fetch('/api/ranking').then(r => r.json()).then(d => {
      if (d.success && d.data) setRanking(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const handlePlay = (song: any) => {
    setPlaylist(ranking as any)
    play({ ...song, coverUrl: apiFileUrl(song.coverUrl), audioUrl: apiFileUrl(song.audioUrl) } as any)
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-[1700px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="text-gradient">歌曲排行榜</span>
            </h1>
          </div>
          <p className="text-gray-500 text-lg">TOP 10 热门歌曲</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20"><p className="text-gray-500">加载中...</p></div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">暂无数据</p></div>
        ) : (
          <div className="space-y-2">
            {ranking.map((song, index) => {
              const rank = index + 1
              const isCurrentSong = currentSong?.id === song.id

              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group flex items-center gap-4 p-4 rounded-xl glass glass-hover cursor-pointer"
                  style={{
                    background: index < 3 ? rankBgColors[index] : undefined,
                    borderColor: index < 3 ? `${rankColors[index]}20` : undefined,
                  }}
                  onClick={() => handlePlay(song)}
                >
                  {/* Rank */}
                  <div className="w-10 text-center flex-shrink-0">
                    {index < 3 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: index * 0.15 }}
                      >
                        <Trophy size={24} fill={rankColors[index]} color={rankColors[index]} className="drop-shadow-lg" />
                      </motion.div>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">{rank}</span>
                    )}
                  </div>

                  {/* Cover */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {song.coverUrl ? (
                      <img src={apiFileUrl(song.coverUrl)} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={20} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-accent-purple transition-colors">{song.title}</p>
                    <p className="text-xs text-gray-500">{song.artist}</p>
                  </div>

                  {/* Play button + Stats */}
                  <div className="flex items-center gap-6">
                    {isCurrentSong && isPlaying ? (
                      <div className="flex gap-0.5 items-end h-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-0.5 bg-accent-purple rounded-full"
                            style={{ height: `${40 + i * 20}%`, animation: `sound-wave 0.8s ease-in-out infinite alternate`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <Play size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    )}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 tabular-nums">
                      <span>{song.playCount.toLocaleString()} 次播放</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
