'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronLeft, Music, ChevronRight } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

function parseLyrics(text: string): { time: number; text: string }[] {
  if (!text) return []
  return text.split("\n").filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3] }
    return { time: 0, text: line }
  }).filter(l => l.text.trim())
}

const apiFileUrl = (url: string | null | undefined) => {
  if (!url) return null
  return url.startsWith("/uploads/") ? url.replace("/uploads/", "/api/uploads/") : url
}

const spotColors = [
  '139,92,246',  // purple
  '59,130,246',  // blue
  '45,212,191',  // teal
  '236,72,153',  // pink
  '251,146,60',  // orange
  '74,222,128',  // green
];

export default function MusicRecommendation() {
  const [songs, setSongs] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedSong, setSelectedSong] = useState<any | null>(null)
  const { play, currentSong, isPlaying, pause, resume, currentTime } = useAudioPlayer()

  useEffect(() => {
    fetch('/api/recommended-songs').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data) && d.data.length > 0) {
        setSongs(d.data.map((s: any) => ({
          id: -(Math.random() * 1e9),
          title: s.title || '',
          artist: s.artist || '山影知道',
          coverUrl: apiFileUrl(s.coverUrl),
          audioUrl: apiFileUrl(s.audioUrl),
          description: s.description || '',
          lyrics: s.lyrics || '',
          isRecommended: true,
        })))
      }
    }).finally(() => setLoaded(true))
  }, [])

  const handleSelect = (song: any) => {
    if (!song.audioUrl) return
    if (selectedSong?.id === song.id) return
    setSelectedSong(song)
    if (currentSong?.id !== song.id) { play(song); return }
    if (!isPlaying) resume()
  }

  const handlePlayPause = () => {
    if (!selectedSong) return
    if (currentSong?.id === selectedSong?.id && isPlaying) pause()
    else if (currentSong?.id === selectedSong?.id) resume()
    else play(selectedSong)
  }

  const lyrics = selectedSong ? parseLyrics(selectedSong.lyrics || '') : []
  const currentLineIdx = useMemo(() => {
    if (!isPlaying || currentSong?.id !== selectedSong?.id) return -1
    return lyrics.findLastIndex(l => currentTime >= l.time)
  }, [currentTime, lyrics, isPlaying, currentSong, selectedSong])

  const displaySongs = loaded && songs.length > 0 ? songs.slice(0, 6) : []
  const showSkeleton = !loaded

  if (loaded && songs.length === 0) return null

  return (
    <section className="relative py-24 lg:py-32 px-4 overflow-hidden">
        {/* Orange breathing blur strip */}
        <div className="absolute top-[15%] -right-[10%] w-[60%] h-[25%] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.08), rgba(249,115,22,0.12), rgba(251,146,60,0.08), transparent)',
            filter: 'blur(60px)',
            transform: 'rotate(-8deg)',
            animation: 'orange-breathe 4s ease-in-out infinite',
          }}
        />
        <style>{'@keyframes orange-breathe { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }'}</style>
{/* Section bg when playing */}
          {selectedSong && selectedSong.coverUrl && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-[-5%] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: 'url(' + selectedSong.coverUrl + ')',
                  opacity: 0.20,
                  filter: 'blur(8px)',
                }}
              />
              {/* Top gradient fade */}
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#080808] via-[#080808]/80 to-transparent" />
              {/* Bottom gradient fade */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
            </div>
          )}
          {/* Content wrapper */}
          <div className="relative z-10">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-accent-purple/[0.02] to-transparent" />
      <div className="max-w-[1700px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 lg:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent-purple/60 mb-2">LISTEN NOW</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">推荐音乐试听</h2>
        </motion.div>
        {showSkeleton ? (
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={'sk-' + i} className="text-center">
                <div className="aspect-square rounded-full skeleton-pulse mx-auto max-w-[150px] sm:max-w-[220px] md:max-w-[280px]" />
                <div className="mt-3 space-y-1.5 px-4">
                  <div className="h-3 w-3/4 skeleton-pulse rounded mx-auto" />
                  <div className="h-2 w-1/2 skeleton-pulse rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedSong ? (
          <>
            {/* ═══ Selected view: record + info, other records below ═══ */}
            <button onClick={() => setSelectedSong(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors mb-6 border border-white/10">
                        <ChevronLeft size={16} />
                        返回推荐歌单
                      </button>
            <div className="flex flex-col gap-8 items-center justify-center mb-10 max-w-2xl mx-auto">
             {/* Left: selected vinyl record */}
              <div className="w-36 sm:w-56 lg:w-72 shrink-0 mx-auto">
<AnimatePresence mode="wait">
                  <motion.div
                    key={selectedSong.id}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={'w-full aspect-square rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center shadow-2xl ' + (isPlaying && currentSong?.id === selectedSong.id ? 'animate-[spin_3s_linear_infinite]' : '')}>
<div className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.012]" />
                  <div className="absolute w-[84%] h-[84%] rounded-full border border-white/[0.012]" />
                  <div className="w-[90%] h-[90%] rounded-full overflow-hidden shadow-md relative">
                    {selectedSong.coverUrl ? (
                      <img src={selectedSong.coverUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-fuchsia-600/20 to-transparent flex items-center justify-center">
                        <Music size={40} className="text-white/20" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              </div>

              {/* Right: song info + lyrics */}
              <div className="flex-1 min-w-0 text-center">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{selectedSong.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-2">{selectedSong.artist}</p>
                {selectedSong.description && (
                  <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">{selectedSong.description}</p>
                )}

                {/* Play button */}
                <button onClick={handlePlayPause}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/20 text-accent-purple text-sm font-medium hover:bg-accent-purple/30 transition-all mb-6">
                  {isPlaying && currentSong?.id === selectedSong.id ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying && currentSong?.id === selectedSong.id ? '暂停' : '播放'}
                </button>

                {/* Lyrics */}
                <div className="mt-2 min-h-[60px]">
                  {currentLineIdx >= 0 ? (
                    <motion.p key={currentLineIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="text-lg sm:text-xl lg:text-2xl text-white/90 font-serif leading-relaxed"
                      style={{ textShadow: '0 0 30px rgba(139,92,246,0.15)' }}>
                      {lyrics[currentLineIdx]?.text}
                    </motion.p>
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      {isPlaying && currentSong?.id === selectedSong.id ? '等待歌词...' : '点击播放查看歌词'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Bottom: all records in horizontal row ═══ */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex gap-4 sm:gap-5 justify-center flex-wrap pb-4">
                {displaySongs.map((song) => (
                  <button key={song.id} onClick={() => handleSelect(song)}
                    className={'shrink-0 w-20 sm:w-24 text-center group transition-all duration-300 ' + (currentSong?.id === song.id && isPlaying ? 'opacity-100' : song.id === selectedSong.id ? 'opacity-60' : 'opacity-70 hover:opacity-100')}>
                    <motion.div layout
                      className={'aspect-square rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center shadow-md transition-shadow duration-300 ' + (!song.audioUrl ? 'opacity-50' : 'group-hover:shadow-[0_0_30px_6px_rgba(139,92,246,0.12),0_0_60px_15px_rgba(139,92,246,0.06)]') + (currentSong?.id === song.id && isPlaying ? ' ring-2 ring-accent-purple/60 ring-offset-2 ring-offset-[#080808]' : '')}>
                      {song.id === selectedSong?.id && (
                        <div className="absolute top-[2%] right-[2%] z-30 pointer-events-none scale-[0.6]" style={{ transform: 'rotate(-18deg) scale(0.6)', transformOrigin: '100% 0%' }}>
                          <svg width="40" height="55" viewBox="0 0 40 55" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6" cy="4" r="4" fill="rgba(180,180,180,0.65)" />
  <circle cx="6" cy="4" r="2" fill="rgba(100,100,100,0.8)" />
  <path d="M8 7 L26 44" stroke="rgba(180,180,180,0.7)" strokeWidth="2.2" strokeLinecap="round" />
  <path d="M25 42 L29 47" stroke="rgba(180,180,180,0.7)" strokeWidth="1.5" strokeLinecap="round" />
  <line x1="27" y1="45" x2="28" y2="50" stroke="rgba(200,200,200,0.5)" strokeWidth="0.8" strokeLinecap="round" />
</svg>
                        </div>
                      )}
                      <div className="w-[85%] h-[85%] rounded-full overflow-hidden shadow-sm">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent flex items-center justify-center">
                            <Music size={16} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-1.5 group-hover:text-white transition-colors">{song.title}</p>
                    <p className="text-[9px] text-gray-600 truncate">{song.artist}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ═══ Default: 3x2 grid ═══ */
          <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {displaySongs.map((song, i) => (
              <motion.button key={song.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => handleSelect(song)}
                className={'group text-center focus:outline-none ' + (!song.audioUrl ? 'opacity-60' : '')}
                style={{ transform: `rotate(${((i % 3) - 1) * 2.5}deg)`, marginTop: i >= 3 ? '1.5rem' : '0' }}
              >
                <div className="aspect-square relative mx-auto max-w-[150px] sm:max-w-[220px] md:max-w-[280px]">
                  {/* Spotlight halo */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-75 group-hover:scale-110"
                    style={{ background: `radial-gradient(ellipse at center, rgba(${spotColors[i]},0.2) 0%, rgba(${spotColors[i]},0.08) 40%, transparent 70%)`, filter: 'blur(8px)' }}
                  />
<div className={'w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center shadow-lg transition-shadow duration-300 group-hover:shadow-[0_0_50px_10px_rgba(139,92,246,0.12),0_0_80px_20px_rgba(139,92,246,0.06)] ' + (isPlaying && currentSong?.id === song.id ? 'animate-[spin_3s_linear_infinite]' : '')}>
                    <div className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.012]" />
                    <div className="absolute w-[84%] h-[84%] rounded-full border border-white/[0.012]" />
                    <div className="w-[90%] h-[90%] rounded-full overflow-hidden shadow-md relative">
                            {song.coverUrl ? (
                        <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-fuchsia-600/20 to-transparent flex items-center justify-center">
                          <Music size={32} className="text-white/20" />
                        </div>
                      )}
                      {/* Overlay text on record */}
                      <div className="absolute inset-0 flex flex-col justify-center px-[14%]">
                        <h3 className="text-white font-bold text-xs sm:text-sm leading-tight text-left drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                          {song.title}
                        </h3>
                        <p className="text-white/80 text-[10px] sm:text-xs mt-1 text-left truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {song.artist}
                        </p>
                      </div>
                      </div>
                  </div>
                  {/* Hover play */}
                  {song.audioUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        {isPlaying && currentSong?.id === song.id ? (
                          <div className="flex items-end gap-[2.5px] h-5">
                            {[1,2,3].map(j => (
                              <div key={j} className="w-[3px] rounded-full bg-black"
                                style={{ height: j * 30 + '%', animation: 'sound-wave 0.6s ease-in-out infinite alternate', animationDelay: j * 0.15 + 's' }} />
                            ))}
                          </div>
                        ) : (
                          <Play size={20} className="text-black ml-0.5" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
    </section>
  )
}
