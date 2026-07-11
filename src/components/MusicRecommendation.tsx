'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronLeft, Music } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

const gradients = [
  'from-purple-600/30 via-fuchsia-600/20', 'from-blue-600/30 via-cyan-600/20',
  'from-indigo-600/30 via-violet-600/20', 'from-cyan-600/30 via-teal-600/20',
  'from-violet-600/30 via-purple-600/20',
]

function parseLyrics(text: string): { time: number; text: string }[] {
  if (!text) return []
  return text.split("\n").filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3] }
    return { time: 0, text: line }
  }).filter(l => l.text.trim())
}

const apiFileUrl = (url: string) => url?.startsWith("/uploads/") ? "/api/files" + url : url

export default function MusicRecommendation() {
  const [songs, setSongs] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const { play, currentSong, isPlaying, pause, resume, currentTime } = useAudioPlayer()

  useEffect(() => {
    // Load from admin recommended settings
    fetch('/api/recommended-songs').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data) && d.data.length > 0) {
        setSongs(d.data.map((s: any, i: number) => ({
          id: -(i + 1),
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

  const displaySongs = loaded && songs.length > 0 ? songs.slice(0, 5) : []

  const handleCardClick = (song: any) => {
    setSelectedSong(song)
    if (currentSong?.id === song.id && isPlaying) { pause(); return }
    if (currentSong?.id === song.id && !isPlaying) { resume(); return }
    play(song)
  }

  const handleBack = () => {
    if (isPlaying) pause()
    setSelectedSong(null)
  }

  const currentLyrics = selectedSong?.lyrics ? parseLyrics(selectedSong.lyrics) : []
  const currentLyricIndex = currentLyrics.findIndex((l, i) => {
    const nextTime = currentLyrics[i + 1]?.time ?? Infinity
    return currentTime >= l.time && currentTime < nextTime
  })

  const isCurrentSong = (song: any) => currentSong?.id === song.id
  const isThisPlaying = (song: any) => currentSong?.id === song.id && isPlaying

  // If loaded and no recommended songs, show nothing
  if (loaded && songs.length === 0) return null

  return (
    <section className="relative py-24 lg:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-purple/[0.02] to-transparent" />
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-5">
          {(loaded ? displaySongs : []).map((song, i) => (
            <button key={song.id} onClick={() => { if (selectedSong) handleBack(); handleCardClick(song) }}
              className="group text-left focus:outline-none">
              <div className="aspect-square relative">
                <div className={`w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center shadow-lg ${isThisPlaying(song) ? 'animate-[spin_3s_linear_infinite]' : ''}`}>
                  <div className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.012]" />
                  <div className="absolute w-[84%] h-[84%] rounded-full border border-white/[0.012]" />
                  <div className="w-[90%] h-[90%] rounded-full overflow-hidden shadow-md relative">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                        <Music size={32} className="text-white/20" />
                      </div>
                    )}
                  </div>
                </div>
                {(!currentSong || currentSong.id !== song.id) && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play size={20} className="text-black ml-0.5" />
                    </div>
                  </div>
                )}
                {isThisPlaying(song) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-accent-purple/90 flex items-center justify-center shadow-lg">
                      <div className="flex items-end gap-[2px] h-5">
                        <div className="w-[3px] rounded-full bg-white animate-bounce" style={{animationDelay:'0ms',height:'60%'}} />
                        <div className="w-[3px] rounded-full bg-white animate-bounce" style={{animationDelay:'200ms',height:'100%'}} />
                        <div className="w-[3px] rounded-full bg-white animate-bounce" style={{animationDelay:'400ms',height:'40%'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2.5 px-0.5">
                <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
