'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Heart, ListMusic, Repeat, Repeat1,
} from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { formatDuration } from '@/lib/utils'

function parseLyrics(text: string | null | undefined): { time: number; text: string }[] {
  if (!text) return []
  return text.split("\n").filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3].trim() }
    return { time: 0, text: line.trim() }
  }).filter(l => l.text && l.text.length > 0 && !/^\w+[：:]/.test(l.text))
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const lastSongIdRef = useRef<number | null>(null)

  const {
    currentSong, isPlaying, volume, currentTime, duration, isMuted, repeatMode,
    setAudioRef, pause, resume, next, prev,
    setVolume, toggleMute, setRepeatMode, seek, setCurrentTime, setDuration,
  } = useAudioPlayer()

  // Register audio ref on mount
  useEffect(() => {
    if (audioRef.current) setAudioRef(audioRef.current)
  }, [setAudioRef])

  // Handle song changes and play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    const isNewSong = currentSong.id !== lastSongIdRef.current
    if (isNewSong) {
      lastSongIdRef.current = currentSong.id
      audio.src = currentSong.audioUrl
      // Increment play count for database songs (positive ID)
      if (currentSong.id > 0) {
        fetch(`/api/songs/${currentSong.id}/play`, { method: 'POST' }).catch(() => {})
      }
    }

    if (isPlaying) {
      // Browser may reject if not in user-gesture context
      audio.play().catch(() => useAudioPlayer.setState({ isPlaying: false }))
    } else {
      audio.pause()
    }
  }, [currentSong?.id, isPlaying, currentSong?.audioUrl])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }, [setCurrentTime])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }, [setDuration])

  const handleEnded = useCallback(() => {
    const state = useAudioPlayer.getState()
    if (state.repeatMode === 'one') {
      // Record play count for repeat
      const s = state.currentSong
      if (s && s.id > 0) {
        fetch(`/api/songs/${s.id}/play`, { method: 'POST' }).catch(() => {})
      }
      seek(0)
      resume()
    } else {
      next()
    }
  }, [next, seek, resume])

  // Find current lyric line
  const lyricLines = currentSong?.lyrics ? parseLyrics(currentSong.lyrics) : []
  const currentLyricIndex = lyricLines.findIndex((l, i) => {
    const nextTime = lyricLines[i + 1]?.time ?? Infinity
    return currentTime >= l.time && currentTime < nextTime
  })
  const currentLyric = currentLyricIndex >= 0 ? lyricLines[currentLyricIndex].text : ''

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (!currentSong) return
          isPlaying ? pause() : resume()
          break
        case 'ArrowLeft': seek(Math.max(0, currentTime - 5)); break
        case 'ArrowRight': seek(Math.min(duration, currentTime + 5)); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSong, isPlaying, currentTime, duration, pause, resume, seek])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    seek(((e.clientX - rect.left) / rect.width) * duration)
  }

  return (
    <>
      {/* Audio element — always mounted */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Player bar */}
      <AnimatePresence>
        {currentSong && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-xl border-t border-white/10"
          >
            <div
              ref={progressRef}
              className="h-1 bg-white/10 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan relative"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>

            <div className="mx-auto max-w-[1770px] px-4 h-20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {currentSong.coverUrl ? (
                    <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-white">{currentSong.title}</p>
                  <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                </div>
              </div>

              {/* Lyrics display */}
              <div className="hidden md:flex items-center justify-center flex-1 max-w-md min-w-0 px-4">
                <AnimatePresence mode="wait">
                  {currentLyric && (
                    <motion.p
                      key={currentLyricIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-white/80 text-center truncate font-light tracking-wide"
                    >
                      {currentLyric}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Repeat mode button */}
              <div className="hidden md:flex items-center justify-center shrink-0">
                <button onClick={() => setRepeatMode(repeatMode === 'one' ? 'none' : 'one')}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    repeatMode === 'one'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                  title={repeatMode === 'one' ? '单曲循环' : '不循环'}
                >
                  {repeatMode === 'one' && (
                    <span className="absolute inset-0 rounded-full bg-red-500/15 blur-sm" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
                  )}
                  {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={prev} className="text-gray-400 hover:text-white transition-colors hidden sm:block"><SkipBack size={20} /></button>
                <button onClick={() => (isPlaying ? pause() : resume())}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105">
                  {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                </button>
                <button onClick={next} className="text-gray-400 hover:text-white transition-colors hidden sm:block"><SkipForward size={20} /></button>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 tabular-nums">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                <span className="text-gray-600">/</span>
                <span>{formatDuration(Math.floor(duration))}</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="hidden sm:block w-20">
                  <input type="range" min={0} max={1} step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg" />
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
