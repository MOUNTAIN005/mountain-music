'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Music, Mail, Github, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => window.location.href = "/", 300); }} className="flex items-center gap-2 mb-4 cursor-pointer">
              <Music className="w-6 h-6 text-accent-purple" />
              <span className="text-xl font-bold text-gradient-animated">
                MOUNTAIN MUSIC
              </span>
            </a>
            <p className="text-sm text-gray-500 leading-relaxed">
              让声音记录灵魂。
              这里是山影知道的个人音乐空间，
              用旋律讲述属于我们的故事。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">导航</h3>
            <ul className="space-y-3">
              {[
                { label: '推荐单曲', href: '/songs' },
                { label: '推荐专辑', href: '/albums' },
                { label: '排行榜', href: '/ranking' },
                { label: '音乐故事', href: '/stories' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-accent-purple transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">互动</h3>
            <ul className="space-y-3">
              {[
                { label: '投稿', href: '/submit' },
                { label: '联系我们', href: '/contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-accent-purple transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">社交</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-accent-purple hover:border-accent-purple transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github size={18} />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={18} />
              </motion.a>
              <motion.a
                href="mailto:hello@mountainmusic.com"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-accent-cyan hover:border-accent-cyan transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={18} />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} 山影知道 | MOUNTAIN Music. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
