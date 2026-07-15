'use client'

import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1 } from 'lucide-react'

export default function MobileBottomPlayer() {
  const { currentSong, isPlaying, pause, resume, next, prev, repeatMode, setRepeatMode } = useAudioPlayer()

  if (!currentSong) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
      {/* Song info */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <span className="text-xs opacity-50">♫</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-medium truncate">{currentSong.title}</p>
          <p className="text-[10px] text-gray-500 truncate">{currentSong.artist || '山影知道'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 px-4 py-2">
        <button
          onClick={() => setRepeatMode(repeatMode === 'none' ? 'one' : 'none')}
          className={`p-1.5 rounded-full transition-colors ${repeatMode === 'one' ? 'text-accent-purple' : 'text-gray-500 hover:text-gray-300'}`}
          title={repeatMode === 'one' ? '单曲循环' : '顺序播放'}
        >
          {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
        </button>

        <button onClick={prev} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="上一曲">
          <SkipBack size={20} />
        </button>

        <button
          onClick={() => (isPlaying ? pause() : resume())}
          className="p-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button onClick={next} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="下一曲">
          <SkipForward size={20} />
        </button>

        <div className="w-[34px]" /> {/* spacer to balance the layout */}
      </div>
    </div>
  )
}
