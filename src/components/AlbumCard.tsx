'use client'

import { motion } from 'framer-motion'
import { Music, Play } from 'lucide-react'
import Link from 'next/link'
import type { Album } from '@/types'

interface AlbumCardProps {
  album: Album
  index?: number
}

export default function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/albums/${album.id}`} className="group block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 mb-4">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={48} className="text-gray-600" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <motion.div
              className="w-16 h-16 rounded-full bg-accent-purple/80 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Play size={28} className="text-white ml-1" />
            </motion.div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Song count */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-gray-300">
            {album.songs?.length || 0} 首
          </div>

          {/* Album info at bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="text-sm font-semibold text-white truncate">
              {album.title}
            </h3>
            {album.description && (
              <p className="text-xs text-gray-300/80 mt-0.5 line-clamp-1">
                {album.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
