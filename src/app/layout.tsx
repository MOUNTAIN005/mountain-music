import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AudioPlayer from '@/components/AudioPlayer'
import ParticleBackground from '@/components/ParticleBackground'
import FloatingPlus from '@/components/FloatingPlus'
import ClientEffects from '@/components/ClientEffects'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '山影知道 | MOUNTAIN Music',
  description: '让声音记录灵魂 - 个人音乐艺术网站',
  keywords: ['音乐', '个人音乐', '山影知道', 'MOUNTAIN Music', '原创音乐'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.variable} bg-[#080808] text-white antialiased`}>
        <ParticleBackground />
        <FloatingPlus />
        <ClientEffects />
        <Header />
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </div>
        <div className="hidden lg:block"><AudioPlayer /></div>
      </body>
    </html>
  )
}
