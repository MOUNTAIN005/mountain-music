'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, ChevronLeft, Disc3, Music, DiscAlbum } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

const apiFileUrl = (url: string | null | undefined) => {
  if (!url) return null
  return url.startsWith("/uploads/") ? url.replace("/uploads/", "/api/uploads/") : url
}

function parseLyrics(text: string): { time: number; text: string }[] {
  if (!text) return []
  return text.split("\n").filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3] }
    return { time: 0, text: line }
  }).filter(l => l.text.trim())
}

export default function AlbumSection() {
  const [albums, setAlbums] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { play, currentSong, isPlaying, pause, resume, currentTime } = useAudioPlayer()

  useEffect(() => {
    fetch('/api/albums').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data) && d.data.length > 0) {
        const mapped = d.data.slice(0, 2).map((a: any) => ({
          ...a,
          coverUrl: apiFileUrl(a.coverUrl),
          songs: (a.songs || []).map((s: any) => ({
            ...s,
            coverUrl: apiFileUrl(s.coverUrl),
            audioUrl: apiFileUrl(s.audioUrl),
          })),
        }))
        setAlbums(mapped)
      }
    }).catch(() => {}).finally(() => setLoaded(true))
  }, [])

  const displayAlbums = loaded ? albums : []
  const showSkeleton = !loaded
  const handleBack = () => { setSelectedKey(null); if (isPlaying) pause() }

  return (
    <section className="relative py-20 lg:py-28 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-blue/[0.02] to-transparent" />
      <div className="max-w-[1770px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 lg:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent-blue/60 mb-2">ALBUM</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">精选专辑推荐</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Loading skeleton */}
          {showSkeleton && Array.from({ length: 2 }).map((_, i) => (
            <div key={`sk-al-${i}`} className="rounded-2xl overflow-hidden glass min-h-[200px]">
              <div className="grid grid-cols-2 h-full">
                <div className="p-5 space-y-4">
                  <div className="h-4 w-3/4 skeleton-pulse" />
                  <div className="space-y-2">
                    {[1,2,3].map(j => <div key={j} className="h-8 skeleton-pulse rounded-xl" />)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="w-full aspect-square rounded-xl skeleton-pulse" />
                </div>
              </div>
            </div>
          ))}
          {loaded && displayAlbums.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <DiscAlbum size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">暂无专辑数据</p>
            </motion.div>
          )}
          {loaded && displayAlbums.slice(0, 2).map((album, ai) => {
            const isSelected = selectedKey?.startsWith(`${album.id}-`)
            const songId = isSelected ? Number(selectedKey?.split('-')[1]) : null
            const song = songId ? album.songs?.find((s: any) => s.id === songId) : null
            const lyrLines = song ? parseLyrics(song.lyrics || '') : []
            const lineIdx = song && isPlaying && currentSong?.id === song.id
              ? lyrLines.findLastIndex(l => currentTime >= l.time) : -1

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: ai * 0.15 }}
                className="rounded-2xl overflow-hidden glass min-h-[200px]"
              >
               {!isSelected ? (
                 <div className="grid grid-cols-2 h-full">
                   <div className="p-4 flex flex-col justify-start">
                      <h3 className="text-base font-semibold text-white mb-4 truncate">
                        <span className="text-gray-400 font-normal text-sm">专辑名：</span>{album.title}
                      </h3>
                     <div className="space-y-0.5">
                       {(album.songs || []).map((s: any) => {
                         const isThis = currentSong?.id === s.id && isPlaying
                         const hasAudio = !!s.audioUrl
                         return (
                           <button key={s.id}
                             onClick={hasAudio ? () => { setSelectedKey(`${album.id}-${s.id}`); play({...s}) } : undefined}
                             className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left group ${hasAudio ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}>
                             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 transition-colors">
                               {hasAudio ? (isThis ? (
                                 <div className="flex gap-0.5 items-end h-2.5">
                                   {[1, 2, 3].map(j => (
                                     <div key={j} className="w-0.5 bg-accent-purple rounded-full"
                                       style={{ height: `${40 + j * 20}%`, animation: `sound-wave 0.8s ease-in-out infinite alternate`, animationDelay: `${j * 0.15}s` }} />
                                   ))}
                                 </div>
                               ) : (
                                 <Play size={12} className="text-gray-400 ml-0.3" />
                               )) : (
                                 <Music size={12} className="text-gray-600" />
                               )}
                             </div>
                             <div className="flex-1 min-w-0">
                               {hasAudio ? (
                                 <span className="text-xs text-white truncate block">{s.title}</span>
                               ) : (
                                 <span className="text-xs text-gray-500 truncate block">
                                   {s.title}{s.description ? ` — ${s.description}` : ''}
                                 </span>
                               )}
                             </div>
                             <span className="text-[10px] text-gray-600 tabular-nums">
                               {Math.floor((s.duration || 200) / 60)}:{String((s.duration || 200) % 60).padStart(2, '0')}
                             </span>
                           </button>
                         )
                       })}
                     </div>
                  </div>
                </div>
                ) : song ? (
                  <div className="grid grid-cols-2 h-full">
                    <div className="p-5 flex flex-col justify-between">
                      <button onClick={handleBack} className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs w-fit mb-4">
                        <ChevronLeft size={14} /> 返回专辑
                      </button>
                      <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="w-full max-w-[140px] aspect-square mx-auto mb-4">
                          <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center shadow-lg p-[5%]"
                            style={{ animation: currentSong?.id === song.id && isPlaying ? 'spin 4s linear infinite' : 'none' }}>
                            <div className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.012]" />
                            <div className="absolute w-[84%] h-[84%] rounded-full border border-white/[0.012]" />
                            <div className="w-[90%] h-[90%] rounded-full overflow-hidden shadow-md">
                              {(song.coverUrl || album.coverUrl) ? (
                                <img src={song.coverUrl || album.coverUrl} className="w-full h-full object-cover" alt={song.title} />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-transparent flex items-center justify-center">
                                  <Music size={24} className="text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="absolute w-2 h-2 rounded-full bg-gray-700 border border-white/10" />
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-semibold text-white">{song.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1">{song.artist || '山影知道'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white/[0.02] flex flex-col justify-center border-l border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-5">歌词</p>
                      {isPlaying && song.id === currentSong?.id && lineIdx >= 0 ? (
                        <p className="text-lg leading-relaxed text-white/90 font-serif tracking-wide"
                          style={{ textShadow: '0 0 20px rgba(139,92,246,0.15)' }}>
                          {lyrLines[lineIdx]?.text}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">播放中查看歌词</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
