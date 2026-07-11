import { create } from 'zustand'
import type { Song } from '@/types'

interface AudioPlayerState {
  currentSong: Song | null
  playlist: Song[]
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isMuted: boolean
  repeatMode: 'none' | 'one'
  audioRef: HTMLAudioElement | null

  setAudioRef: (ref: HTMLAudioElement) => void
  play: (song?: Song) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setRepeatMode: (mode: 'none' | 'one') => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaylist: (songs: Song[]) => void
  addToPlaylist: (song: Song) => void
  removeFromPlaylist: (songId: number) => void
}

export const useAudioPlayer = create<AudioPlayerState>((set, get) => ({
  currentSong: null,
  playlist: [],
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isMuted: false,
  repeatMode: 'none',
  audioRef: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  // play() ONLY updates state — AudioPlayer's useEffect handles actual playback
  play: (song) => {
    const state = get()
    const targetSong = song || state.currentSong
    if (!targetSong) return

    if (song && song.id !== state.currentSong?.id) {
      set({ currentSong: song, currentTime: 0, isPlaying: true, duration: 0 })
    } else {
      set({ isPlaying: true })
    }
  },

  pause: () => {
    get().audioRef?.pause()
    set({ isPlaying: false })
  },

  resume: () => {
    const audio = get().audioRef
    if (audio) {
      audio.play().catch(() => set({ isPlaying: false }))
      set({ isPlaying: true })
    }
  },

  next: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    get().play(playlist[nextIndex])
  },

  prev: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    get().play(playlist[prevIndex])
  },

  setVolume: (volume) => {
    get().audioRef ? (get().audioRef!.volume = volume) : null
    set({ volume, isMuted: volume === 0 })
  },

  toggleMute: () => {
    const { isMuted, audioRef, volume } = get()
    if (audioRef) audioRef.volume = isMuted ? volume : 0
    set({ isMuted: !isMuted })
  },
  setRepeatMode: (mode) => set({ repeatMode: mode }),

  seek: (time) => {
    const audio = get().audioRef
    if (audio) audio.currentTime = time
    set({ currentTime: time })
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setPlaylist: (songs) => set({ playlist: songs }),
  addToPlaylist: (song) => {
    const { playlist } = get()
    if (!playlist.find((s) => s.id === song.id)) set({ playlist: [...playlist, song] })
  },
  removeFromPlaylist: (songId) => {
    set({ playlist: get().playlist.filter((s) => s.id !== songId) })
  },
}))
