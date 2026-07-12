'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Loader2, Play, Pause, Music2 } from 'lucide-react'
import { notFound, useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

function parseLyrics(text: string | null | undefined): { time: number; text: string }[] {
  if (!text) return []
  return text.split('\n').filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3] }
    return { time: 0, text: line }
  }).filter(l => l.text.trim())
}

export default function StoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { play: audioPlay, pause: audioPause, currentSong, isPlaying, currentTime, resume } = useAudioPlayer()
  const [story, setStory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    fetch(`/api/stories/${id}`)
      .then(r => {
        if (r.status === 404) { setIsNotFound(true); return null }
        return r.json()
      })
      .then(d => {
        if (d && d.success) setStory(d.data)
        else if (d) setIsNotFound(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4 flex items-center justify-center">
        <Loader2 size={32} className="text-gray-600 animate-spin" />
      </div>
    )
  }

  if (isNotFound || !story) return notFound()

  const relatedSong = story.song ? {
    id: -(2000 + story.id),
    title: story.songTitle || story.song.title,
    artist: story.song.artist,
    coverUrl: story.song.coverUrl || null,
    audioUrl: story.song.audioUrl,
    lyrics: story.lyrics || story.song.lyrics || '',
    description: null,
    genre: null,
    duration: story.song.duration || 0,
    playCount: 0,
    likeCount: 0,
    sortOrder: 0,
    isPublished: true,
    albumId: null,
    album: story.song.album || null,
    createdAt: '',
    updatedAt: '',
  } : null

  const isThisPlaying = relatedSong && currentSong?.id === relatedSong.id && isPlaying
  const lyricsLines = relatedSong ? parseLyrics(relatedSong.lyrics) : []
  const currentLineIdx = isThisPlaying
    ? lyricsLines.findLastIndex(l => currentTime >= l.time) : -1

  const handlePlaySong = () => {
    if (!relatedSong) return
    if (currentSong?.id === relatedSong.id && isPlaying) { audioPause(); return }
    if (currentSong?.id === relatedSong.id && !isPlaying) { resume(); return }
    audioPlay(relatedSong)
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          返回
        </button>

        {/* Story hero with image + overlaid title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-video rounded-2xl overflow-hidden mb-6 shadow-lg shadow-accent-purple/[0.03]"
        >
          {story.imageUrl ? (
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-purple/15 via-accent-blue/10 to-transparent border border-white/5" />
          )}
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
          {/* Title + metadata on top */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              <span className="text-gradient">{story.title}</span>
            </h1>
          </div>
        </motion.div>

        {/* Compact Music Player */}
        {relatedSong && (
          <div className="p-4 rounded-xl glass border border-white/5 mb-6">
            <div className="flex items-center gap-3">
              {/* Mini vinyl disc */}
              <button onClick={handlePlaySong} className="relative w-10 h-10 shrink-0 group">
                <div className={`w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center ${isThisPlaying ? "animate-[spin_3s_linear_infinite]" : ""}`}>
                  <div className="w-[88%] h-[88%] rounded-full overflow-hidden">
                    {relatedSong.coverUrl ? (
                      <img src={relatedSong.coverUrl} className="w-full h-full object-cover rounded-full" alt="" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-purple/30 via-accent-blue/20 to-transparent flex items-center justify-center">
                        <Music2 size={14} className="text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    {isThisPlaying ? <Pause size={10} className="text-black" /> : <Play size={10} className="text-black ml-0.5" />}
                  </div>
                </div>
              </button>

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{relatedSong.title}</p>
                <p className="text-xs text-gray-400">{relatedSong.artist}</p>
              </div>

              {/* Play button + sound wave */}
              <button onClick={handlePlaySong}
                className="w-8 h-8 rounded-full bg-accent-purple/90 flex items-center justify-center hover:bg-accent-purple transition-all shrink-0">
                {isThisPlaying ? <Pause size={13} className="text-white" /> : <Play size={13} className="text-white ml-0.5" />}
              </button>
              {isThisPlaying && (
                <div className="flex items-end gap-px h-4 shrink-0">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-[2px] rounded-full bg-accent-purple"
                      style={{ height: `${30 + i * 20}%`, animation: `sound-wave 0.6s ease-in-out infinite alternate`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Compact lyrics */}
            {lyricsLines.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="space-y-0.5 max-h-24 overflow-y-auto text-xs pr-1">
                  {lyricsLines.map((line, i) => {
                    const isCurrent = i === currentLineIdx
                    const isPast = currentLineIdx >= 0 && i < currentLineIdx
                    return (
                      <div key={i} className={`flex items-start gap-2 py-0.5 transition-all duration-200 ${isCurrent ? "text-white" : isPast ? "text-gray-500" : "text-gray-600"}`}>
                        <span className={`text-[9px] tabular-nums w-12 shrink-0 pt-0.5 ${isCurrent ? "text-accent-purple font-medium" : "text-gray-700"}`}>
                          {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, "0")}
                        </span>
                        <span className={`text-xs leading-relaxed ${isCurrent ? "font-medium" : ""}`}>{line.text}</span>
                        {isCurrent && <span className="w-1 h-1 rounded-full bg-accent-purple mt-1 shrink-0 animate-pulse" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="prose prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-gray-300 leading-[1.85] mb-6 text-base tracking-wide"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Author & date */}
          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-end gap-3 text-sm text-gray-500">
            <span>{story.author}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{formatDate(story.createdAt)}</span>
          </div>
        </motion.article>

      </div>
    </div>
  )
}
