'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronDown, Music2 } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { Song } from '@/types'

function parseLyrics(text: string): { time: number; text: string }[] {
  if (!text) return []
  return text.split('\n').filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3] }
    return { time: 0, text: line }
  }).filter(l => l.text.trim())
}

export default function HeroSection() {
  const { play, currentSong, isPlaying, pause, resume, currentTime } = useAudioPlayer()
  const [heroData, setHeroData] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Parallax background effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  useEffect(() => {
    fetch('/api/settings/hero').then(r => r.json()).then(d => {
      if (d.success && d.data) setHeroData(d.data)
    }).finally(() => setLoaded(true))
  }, [])

  const hasAlbum = !!(heroData?.album)
  const song = loaded && heroData && heroData.audioUrl ? {
    id: -999,
    title: heroData.title || '',
    artist: heroData.artist || '山影知道',
    coverUrl: heroData.coverImage || null,
    audioUrl: heroData.audioUrl || '',
    description: heroData.description || '',
    lyrics: heroData.lyrics || '',
    genre: null,
    duration: 0,
    playCount: 0,
    likeCount: 0,
    sortOrder: 0,
    isPublished: true,
    albumId: null,
    createdAt: '',
    updatedAt: '',
  } as Song : null

  const lyricsLines = useMemo(() => parseLyrics(heroData?.lyrics || ''), [heroData?.lyrics])
  const currentLineIdx = isPlaying && currentSong?.id === song?.id
    ? lyricsLines.findLastIndex(l => currentTime >= l.time) : -1

  const bgImage = heroData?.bgImage || '/images/hero-bg.png'
  const isThisPlaying = currentSong?.id === song?.id && isPlaying

  const handlePlayPause = () => {
    if (!song) return
    if (currentSong?.id === song.id && isPlaying) { pause(); return }
    if (currentSong?.id === song.id && !isPlaying) { resume(); return }
    
    // Track play count for matching DB song
    if (heroData?.title) {
      fetch('/api/songs').then(r => r.json()).then(d => {
        if (d.success) {
          const match = d.data.find((s: any) => s.title === heroData.title)
          if (match && match.id > 0) fetch(`/api/songs/${match.id}/play`, { method: 'POST' })
        }
      }).catch(() => {})
    }
    
    play(song)
  }

  if (!song) return (
    <section className="relative w-full aspect-video max-h-screen overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#080808]/80 via-[#080808]/30 to-transparent" />
      </div>
      {/* Empty state content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Music2 size={48} className="text-white/10 mx-auto mb-6" style={{ animation: 'float-note 3s ease-in-out infinite' }} />
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-gradient-animated mb-4 text-breath-glow">
            MOUNTAIN MUSIC
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-md mx-auto mt-20 tracking-[0.5em]">
            让声音记录灵魂
          </p>
        </motion.div>
      </div>
    </section>
  )

 return (
    <>
    <section className="relative w-full aspect-video max-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 will-change-transform"
          style={{
            backgroundImage: `url(${bgImage})`,
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#080808]/80 via-[#080808]/30 to-transparent" />
        {/* Float particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-accent-purple/30"
              style={{ left: `${28 + i * 18}%`, top: `${28 + i * 13}%` }} />
          ))}
        </div>
</div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center px-6 lg:px-16">
        <div className="w-full max-w-[1770px] mx-auto flex items-center gap-8 lg:gap-16">
          {/* Album cover */}
          <motion.div className="flex-shrink-0"
            initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-gray-950 shadow-2xl shadow-accent-purple/10"
                style={{ animation: isThisPlaying ? 'spin 4s linear infinite' : 'none' }}>
                <div className="absolute inset-[1%] rounded-full border border-white/[0.015]" />
                <div className="absolute inset-[2.5%] rounded-full border border-white/[0.015]" />
                <div className="absolute inset-[4%] rounded-full border border-white/[0.015]" />
                <div className="absolute inset-[5%] rounded-full overflow-hidden shadow-lg">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} className="w-full h-full object-cover" alt={song.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-purple/30 via-accent-blue/30 to-transparent flex items-center justify-center">
                      <span className="text-2xl opacity-30">♫</span>
                    </div>
                  )}
                </div>
                <div className="absolute w-3 h-3 rounded-full bg-gray-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/10" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <motion.p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-accent-purple/70 mb-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              主打推荐 · FEATURED
            </motion.p>
            <motion.h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-1"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              {song.title}
            </motion.h1>

            {/* Artist & Album — left-aligned below title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-4 space-y-0.5"
            >
              <p className="text-base sm:text-lg text-gray-200/90 font-medium tracking-wide">
                {song.artist}
              </p>
              {hasAlbum && (
                <p className="text-sm sm:text-base text-gray-500">
                  {heroData.album}
                </p>
              )}
            </motion.div>

            <motion.p className="text-base sm:text-lg text-gray-300 max-w-xl mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              {song.description}
            </motion.p>

            {/* Play button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <button onClick={handlePlayPause}
                className="group relative inline-flex items-center gap-3 px-8 py-3 sm:px-10 sm:py-4 rounded-full bg-white text-black font-medium overflow-hidden transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-white/10">
                <span>{isThisPlaying ? <Pause size={20} /> : <Play size={20} />}</span>
                <span>{isThisPlaying ? '暂停' : '播放主打曲'}</span>

              </button>
            </motion.div>

            {/* Audio visualizer */}
            <motion.div className="flex items-center gap-1 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}>
              {[24, 32, 16, 24, 32, 16, 24, 32].map((h, i) => (
                <div key={i} className="w-[3px] rounded-full bg-accent-purple/40"
                  style={{ height: h, animation: isThisPlaying ? `sound-wave 0.8s ease-in-out infinite alternate` : 'none', animationDelay: `${(i + 1) * 0.1}s` }} />
              ))}
            </motion.div>
          </div>

          {/* Lyrics */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 max-w-[600px] min-h-[288px]">
            <AnimatePresence mode="wait">
              {isThisPlaying && currentLineIdx >= 0 ? (
                <motion.p key={currentLineIdx} initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="text-2xl leading-relaxed text-white/90 font-serif tracking-wide text-center"
                  style={{ textShadow: '0 0 30px rgba(139,92,246,0.2)' }}>
                  {lyricsLines[currentLineIdx]?.text}
                </motion.p>
              ) : (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 italic">点击播放查看歌词</motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
    </div>
    </section>
    {/* Scroll-down indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none"
    >
      <span className="text-[10px] text-white/30 tracking-[0.15em] uppercase">Scroll</span>
      <ChevronDown size={16} className="text-white/40" style={{ animation: 'bounce-subtle 2s ease-in-out infinite' }} />
    </motion.div>
    </>
  )
}
