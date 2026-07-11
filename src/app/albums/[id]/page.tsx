'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Play, Calendar, Disc3, ChevronLeft } from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { formatDate } from '@/lib/utils'

const apiFileUrl = (url: string | null | undefined) => {
  if (!url) return null
  return url.startsWith("/uploads/") ? "/api/files" + url : url
}

export default function AlbumDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [album, setAlbum] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { play, currentSong, isPlaying } = useAudioPlayer()

  useEffect(() => {
    if (!id) return
    fetch(`/api/albums/${id}`).then(r => r.json()).then(d => {
      if (d.success && d.data) {
        const a = d.data
        setAlbum({
          ...a,
          coverUrl: apiFileUrl(a.coverUrl),
          songs: (a.songs || []).map((s: any) => ({
            ...s,
            coverUrl: apiFileUrl(s.coverUrl),
            audioUrl: apiFileUrl(s.audioUrl),
          })),
        })
      }
    }).finally(() => setLoading(false))
  }, [id])

  const handlePlay = (song: any, idx: number) => {
    play({ ...song, albumTitle: album?.title })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Music size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">专辑未找到</h2>
          <p className="text-gray-500 mb-6">该专辑不存在或已下架</p>
          <Link href="/albums" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            <ChevronLeft size={16} />返回专辑列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link href="/albums" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm mb-8">
          <ChevronLeft size={16} /> 返回专辑列表
        </Link>

        {/* Album header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <Disc3 size={64} className="text-gray-600" />
            )}
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-purple/60 mb-2">专辑</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{album.title}</h1>
            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">{album.description || '暂无介绍'}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Music size={12} /> {album.songs?.length || 0} 首歌曲</span>
              {album.releaseDate && <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(album.releaseDate)}</span>}
            </div>
          </div>
        </motion.div>

        {/* Song list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-white mb-4">歌曲列表</h2>
          <div className="space-y-1">
            {(album.songs || []).map((song: any, idx: number) => {
              const isCurrent = currentSong?.id === song.id && isPlaying
              return (
                <motion.div key={song.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => handlePlay(song, idx)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    isCurrent ? 'bg-accent-purple/10 border border-accent-purple/20' : 'hover:bg-white/[0.04] border border-transparent'
                  }`}>
                  {/* Play button */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isCurrent ? '#8b5cf6' : 'rgba(255,255,255,0.08)' }}>
                    {isCurrent ? (
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-[2px] rounded-full bg-white" style={{ height: '60%', animation: 'sound-wave 0.8s ease-in-out infinite alternate' }} />
                        <div className="w-[2px] rounded-full bg-white" style={{ height: '100%', animation: 'sound-wave 0.8s ease-in-out infinite alternate', animationDelay: '0.15s' }} />
                        <div className="w-[2px] rounded-full bg-white" style={{ height: '40%', animation: 'sound-wave 0.8s ease-in-out infinite alternate', animationDelay: '0.3s' }} />
                      </div>
                    ) : (
                      <Play size={14} className="text-gray-400 ml-0.5" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-accent-purple' : 'text-white'}`}>{song.title}</p>
                    <p className="text-xs text-gray-500">{song.artist || '山影知道'}</p>
                  </div>
                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600">
                    {song.playCount > 0 && <span>{song.playCount} 次播放</span>}
                  </div>
                  <span className="text-xs text-gray-600 tabular-nums shrink-0 w-10 text-right">
                    {Math.floor((song.duration || 0) / 60)}:{String((song.duration || 0) % 60).padStart(2, '0')}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
