'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Disc3,
  Image as ImageIcon,
  Music,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: '创建专辑', href: '/admin/albums', icon: Disc3 },
  { label: 'HERO编辑', href: '/admin/hero', icon: ImageIcon },
  { label: '推荐歌曲编辑', href: '/admin/recommend', icon: Music },
  { label: '审核投稿', href: '/admin/submissions', icon: FileText },
  { label: '网站设置', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  // Login page: no sidebar, just render children
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#080808]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#080808] border-r border-white/5 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="text-base font-bold tracking-[0.15em] text-white hover:text-white/80 transition-colors">
            MOUNTAIN <span className="text-white/40 font-normal">MUSIC</span>
          </Link>
          <p className="text-[10px] text-gray-600 mt-0.5 tracking-wider">管理后台</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-accent-purple/10 text-accent-purple font-medium'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-white transition-colors">
            ← 返回前台
          </Link>
          <button onClick={() => { document.cookie = 'token=; path=/; max-age=0'; window.location.href = '/admin/login'; }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors">
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="text-xs text-gray-500">管理后台</span>
          <div className="w-7" />
        </div>

        <div className="flex-1 p-5 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
