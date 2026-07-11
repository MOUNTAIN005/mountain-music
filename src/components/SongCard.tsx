'use client'

import { motion } from 'framer-motion'
import { Play, Music } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { formatDuration } from '@/lib/utils'
import type { Song } from '@/types'

interface SongCardProps {
  song: Song
  index?: number
}

export default function SongCard({ song, index }: SongCardProps) {
  const { play, currentSong, isPlaying, setPlaylist } = useAudioPlayer()

  const isCurrentSong = currentSong?.id === song.id

  const handlePlay = () => {
    setPlaylist([song])
    play(song)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.05 }}
      className="group relative flex items-center gap-4 p-3 rounded-xl glass glass-hover cursor-pointer"
      onClick={handlePlay}
    >
      {/* Cover */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={24} className="text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isCurrentSong && isPlaying ? (
            <div className="flex gap-0.5 items-end h-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-accent-purple rounded-full visualizer-bar"
                  style={{ animationDelay: `${i * 0.15}s`, height: '60%' }}
                />
              ))}
            </div>
          ) : (
            <Play size={20} className="text-white" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-accent-purple transition-colors">
          {song.title}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{song.artist}</p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
        {song.genre && (
          <span className="px-2 py-1 rounded-full bg-white/5">{song.genre}</span>
        )}
        {song.duration > 0 && (
          <span className="tabular-nums">{formatDuration(song.duration)}</span>
        )}
      </div>
    </motion.div>
  )
}
