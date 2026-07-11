'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Music } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { Song } from '@/types'

type SongItem = Song & { isRecommended?: boolean }

const apiFileUrl = (url: string) => url?.startsWith("/uploads/") ? "/api/files" + url : url

const formatDuration = (sec: number) => {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Memoized SongRow component
const SongRow = memo(function SongRow({ song, isCurrent, isThisPlaying, onPlay }: {
  song: SongItem; isCurrent: boolean; isThisPlaying: boolean; onPlay: (s: SongItem) => void
}) {
  return (
    <div
      onClick={() => onPlay(song)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer h-[44px] min-h-[44px] box-border ${
        isCurrent ? 'bg-accent-purple/10 border border-accent-purple/20' : 'hover:bg-white/[0.04] border border-white/5'
      }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isThisPlaying ? 'bg-accent-purple' : 'bg-white/10 hover:bg-accent-purple/80'
      }`}>
        <Play size={11} className={`text-white ml-0.5 ${isThisPlaying ? 'opacity-70' : ''}`} fill="white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isCurrent ? 'text-accent-purple' : 'text-gray-200'}`}>{song.title}</p>
        <p className="text-[10px] text-gray-600 truncate">{song.artist}{song.genre ? ` · ${song.genre}` : ''}</p>
      </div>
      {song.isRecommended && (
        <span className="text-[9px] font-semibold text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 px-1.5 py-0.5 rounded-full shrink-0">推荐</span>
      )}
      <span className="text-[10px] text-gray-600 shrink-0 tabular-nums w-10 text-right">{formatDuration(song.duration)}</span>
    </div>
  )
})

export default function SongsPage() {
  const [songs, setSongs] = useState<SongItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Use selectors to only subscribe to needed state
  const currentSong = useAudioPlayer(s => s.currentSong)
  const isPlaying = useAudioPlayer(s => s.isPlaying)
  const pause = useAudioPlayer(s => s.pause)
  const play = useAudioPlayer(s => s.play)

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(d => {
      if (d.success) setSongs(d.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const handlePlay = (song: SongItem) => {
    if (currentSong?.id === song.id && isPlaying) {
      pause()
    } else {
      play(song)
    }
  }

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-[1700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">推荐单曲</span>
          </h1>
          <p className="text-gray-500 text-lg">发现属于你的声音</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="搜索歌曲或艺术家..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all" />
        </motion.div>

        {loading ? (
          <div className="text-center py-20"><p className="text-gray-500">加载中...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">没有找到相关歌曲</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[0, 1, 2].map(colIdx => (
              <div key={colIdx} className="space-y-0.5">
                {filtered.filter((_, i) => i % 3 === colIdx).map(song => (
                  <SongRow
                    key={song.id}
                    song={song}
                    isCurrent={currentSong?.id === song.id}
                    isThisPlaying={currentSong?.id === song.id && isPlaying}
                    onPlay={handlePlay}
                  />
                ))}
                {filtered.filter((_, i) => i % 3 === colIdx).length === 0 && (
                  <p className="text-xs text-gray-700 text-center py-8">暂无歌曲</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
