'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AlbumCard from '@/components/AlbumCard'
import type { Album } from '@/types'

const apiFileUrl = (url: string | null | undefined) => {
  if (!url) return null
  return url.startsWith("/uploads/") ? "/api/files" + url : url
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/albums').then(r => r.json()).then(d => {
      if (d.success && d.data) {
        // Convert upload URLs
        const mapped = d.data.map((a: any) => ({
          ...a,
          coverUrl: apiFileUrl(a.coverUrl),
          songs: (a.songs || []).map((s: any) => ({ ...s, coverUrl: apiFileUrl(s.coverUrl) })),
        }))
        setAlbums(mapped)
      }
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">推荐专辑</span>
          </h1>
          <p className="text-gray-500 text-lg">
            用心编排的专辑，带您进入完整的音乐旅程
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20"><p className="text-gray-500">加载中...</p></div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-500">暂无专辑</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {albums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
