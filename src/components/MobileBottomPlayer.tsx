'use client'

import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1 } from 'lucide-react'

export default function MobileBottomPlayer() {
  const { currentSong, isPlaying, pause, resume, next, prev, repeatMode, setRepeatMode } = useAudioPlayer()

  if (!currentSong) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl safe-area-bottom">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Album art */}
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] opacity-50">♫</span>
          </div>
        )}

        {/* Song info */}
        <div className="flex-1 min-w-0 mr-1">
          <p className="text-xs text-white font-medium truncate leading-tight">{currentSong.title}</p>
          <p className="text-[10px] text-gray-500 truncate leading-tight">{currentSong.artist || '山影知道'}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setRepeatMode(repeatMode === 'none' ? 'one' : 'none')}
            className={`p-1 rounded transition-colors ${repeatMode === 'one' ? 'text-accent-purple' : 'text-gray-500'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>

          <button onClick={prev} className="p-1 text-gray-400" title="上一曲">
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="p-1.5 rounded-full bg-white text-black"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button onClick={next} className="p-1 text-gray-400" title="下一曲">
            <SkipForward size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
