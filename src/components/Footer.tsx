'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Music } from 'lucide-react'

// Platform SVG icons (24x24)
const platformIcons = {
  douyin: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4h4v12a3 3 0 1 1-3-3V4Z" />
      <path d="M13 4a4 4 0 0 0 4 4V4h-4Z" />
    </svg>
  ),
  netease: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.5-9.5" />
      <path d="M19 21a3 3 0 0 0 3-3v-1" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),
  qqmusic: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="19" cy="16" r="2.5" />
      <path d="M9 12l10-2" />
    </svg>
  ),
  kugou: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15c0 3 2 6 5 6 4 0 5-9 8-9s4 5 5 5c2 0 3-2 3-4" />
      <path d="M3 12c0-4 3-9 8-9s6 5 8 6" />
    </svg>
  ),
  kuwo: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3" />
      <path d="M6 21v-1c0-3.3 2.7-6 6-6s6 2.7 6 6v1" />
      <path d="M12 2C7 2 4 6 4 10" />
    </svg>
  ),
  qishui: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 4 3 7 5 9l3 3 3-3c2-2 5-5 5-9a8 8 0 0 0-8-8Z" />
      <path d="M10 8a2 2 0 1 1 4 0v3" />
    </svg>
  ),
  _default: ({ size = 24 }) => <Music size={size} />,
}

const platformLabels: Record<string, string> = {
  douyin: '抖音',
  netease: '网易云音乐',
  qqmusic: 'QQ音乐',
  kugou: '酷狗音乐',
  kuwo: '酷我音乐',
  qishui: '汽水音乐',
}

export default function Footer() {
  const [socials, setSocials] = useState<any[]>([])
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [footerTitle, setFooterTitle] = useState('MOUNTAIN MUSIC')
  const [footerDescription, setFooterDescription] = useState('让声音记录灵魂。这里是山影知道的个人音乐空间，用旋律讲述属于我们的故事。')
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/socials').then(r => r.json()).then(d => {
      if (d.success) setSocials(d.data?.filter((s: any) => s.isActive) || [])
    }).catch(() => {})

    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.success && d.data) {
        if (d.data.footerTitle) setFooterTitle(d.data.footerTitle)
        if (d.data.footerDescription) setFooterDescription(d.data.footerDescription)
      }
    }).catch(() => {})
  }, [pathname])

  const handleClick = (platform: string) => {
    setActivePopup(activePopup === platform ? null : platform)
    setHoveredPlatform(null)
  }

  const currentPlatform = activePopup || hoveredPlatform
  const activeSocial = activePopup ? socials.find(s => s.platform === activePopup) : null

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080808]">
      <div className="mx-auto max-w-[1770px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-12">
          {/* Brand */}
          <div>
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 mb-10 cursor-pointer group"
            >
              <Music className="w-6 h-6 text-accent-purple group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gradient-animated">
                {footerTitle}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed tracking-[0.15em] whitespace-nowrap">
              {footerDescription}
            </p>
          </div>

          {/* Social platforms */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5">关注我们</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((social) => {
                const Icon = platformIcons[social.platform as keyof typeof platformIcons] || platformIcons._default

                return (
                  <div
                    key={social.platform}
                    className="relative"
                    onMouseEnter={() => {
                      if (activePopup !== social.platform) setHoveredPlatform(social.platform)
                    }}
                    onMouseLeave={() => {
                      if (activePopup !== social.platform) setHoveredPlatform(null)
                    }}
                  >
                    <button
                      onClick={() => handleClick(social.platform)}
                      className="w-12 h-12 rounded-full glass flex items-center justify-center text-gray-400 hover:text-accent-purple hover:border-accent-purple/30 transition-all"
                    >
                      <Icon size={20} />
                    </button>
                    <p className="text-[10px] text-gray-600 text-center mt-1.5">{platformLabels[social.platform] || social.platform}</p>

                    {/* Account name tooltip (on hover) */}
                    <AnimatePresence>
                      {currentPlatform === social.platform && social.qrCodeUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 pointer-events-none"
                        >
                          <div className="px-2.5 py-1 rounded-lg glass border border-white/10 shadow-lg text-center whitespace-nowrap">
                            <p className="text-[11px] text-gray-300 font-medium">{social.accountName || social.name}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
            {socials.length === 0 && (
              <p className="text-xs text-gray-600">暂无社交平台数据</p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-600 pt-[5px] pb-24">
            &copy; {currentYear} 山影知道 | MOUNTAIN Music. All rights reserved.
          </p>
        </div>
      </div>
            {/* Global QR Code Modal */}
        <AnimatePresence>
          {activeSocial?.qrCodeUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setActivePopup(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                className="bg-[#121212] rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/40 text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-52 h-52 mx-auto rounded-xl overflow-hidden bg-white/5 flex items-center justify-center mb-3">
                  <img
                    src={activeSocial.qrCodeUrl}
                    alt={`${activeSocial.name}二维码`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-gray-300 font-medium">{activeSocial.accountName || activeSocial.name}</p>
                <p className="text-[10px] text-gray-600 mt-1.5">点击关闭</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </footer>
  )
}
