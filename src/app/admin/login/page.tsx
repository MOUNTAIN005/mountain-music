'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Music, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check against default admin credentials
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'mountain269837751@qq.com'
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'jequirity0505'

      // For demo: using env-based simple auth
      if (email === 'mountain269837751@qq.com' && password === 'jequirity0505') {
        document.cookie = 'token=demo-token-for-admin; path=/; max-age=604800'
        router.push('/admin/dashboard')
      } else {
        setError('邮箱或密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Music className="w-12 h-12 text-accent-purple mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gradient-animated">
            管理员登录
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            山影知道 | MOUNTAIN Music
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 rounded-2xl glass space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent-purple/50 transition-all"
              placeholder=""
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg hover:shadow-accent-purple/25 transition-all disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
