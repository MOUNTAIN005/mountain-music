'use client'

import { useRef } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1 } from 'lucide-react'

export default function MobileBottomPlayer() {
  const progressRef = useRef<HTMLDivElement>(null)
  const { currentSong, isPlaying, pause, resume, next, prev, repeatMode, setRepeatMode, currentTime, duration, seek } = useAudioPlayer()

  if (!currentSong) return null

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    seek(((e.clientX - rect.left) / rect.width) * duration)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl safe-area-bottom">
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-accent-purple to-accent-blue relative"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2.5">
        {/* Album art */}
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
            <span className="text-[9px] opacity-50">♫</span>
          </div>
        )}

        {/* Song info - width limited */}
        <div className="flex-1 min-w-0 max-w-[40%]">
          <p className="text-xs text-white font-medium truncate leading-tight">{currentSong.title}</p>
          <p className="text-[10px] text-gray-500 truncate leading-tight">{currentSong.artist || '山影知道'}</p>
        </div>

        {/* Controls - centered */}
        <div className="flex items-center gap-0.5 shrink-0 ml-auto">
          <button
            onClick={() => setRepeatMode(repeatMode === 'none' ? 'one' : 'none')}
            className={`p-0.5 rounded transition-colors ${repeatMode === 'one' ? 'text-accent-purple' : 'text-gray-500'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
          </button>

          <button onClick={prev} className="p-0.5 text-gray-400">
            <SkipBack size={13} />
          </button>

          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="p-1 rounded-full bg-white text-black mx-0.5"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button onClick={next} className="p-0.5 text-gray-400">
            <SkipForward size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
