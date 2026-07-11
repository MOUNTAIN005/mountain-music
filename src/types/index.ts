export interface Song {
  id: number
  title: string
  artist: string
  coverUrl: string | null
  audioUrl: string
  lyrics: string | null
  description: string | null
  genre: string | null
  duration: number
  playCount: number
  likeCount: number
  sortOrder: number
  isPublished: boolean
  albumId: number | null
  album?: Album | null
  createdAt: string
  updatedAt: string
}

export interface Album {
  id: number
  title: string
  description: string | null
  coverUrl: string | null
  releaseDate: string | null
  playCount: number
  isPublished: boolean
  songs: Song[]
  createdAt: string
  updatedAt: string
}

export interface Story {
  id: number
  title: string
  author: string
  content: string
  imageUrl: string | null
  status: string
  submittedBy: string | null
  submitterEmail: string | null
  attachmentUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface Setting {
  id: number
  key: string
  value: string
}

export interface PlayRecord {
  id: number
  songId: number
  ip: string | null
  createdAt: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}

export interface PlayerState {
  currentSong: Song | null
  playlist: Song[]
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isMuted: boolean
}
