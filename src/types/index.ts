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
  album?: { id: number; title: string } | null
  createdAt: string
  updatedAt: string
}

export interface Story {
  id: number
  title: string
  author: string
  content: string
  imageUrl: string | null
  status?: string
  isRead?: boolean
  isDisplayed?: boolean
  isFeatured?: boolean
  songId?: number | null
  songTitle?: string | null
  lyrics?: string | null
  song?: { id: number; title: string; artist: string; audioUrl: string; lyrics: string | null; coverUrl: string | null; album?: { title: string } | null } | null
  submittedBy: string | null
  submitterEmail: string | null
  attachmentUrl: string | null
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
