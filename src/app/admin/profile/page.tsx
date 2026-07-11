'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Save, LogOut } from 'lucide-react'

export default function AdminProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少6个字符' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: '密码修改成功' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.error || '修改失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '修改失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">管理员设置</h1>
        <p className="text-gray-500 text-sm mt-1">修改密码与账户管理</p>
      </div>

      <div className="max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass space-y-6"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock size={18} />
            修改密码
          </h2>

          {message.text && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">当前密码</label>
              <input type="password" required value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="输入当前密码" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">新密码</label>
              <input type="password" required value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="至少6个字符" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">确认新密码</label>
              <input type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="再次输入新密码" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
              <Save size={18} />
              {loading ? '修改中...' : '修改密码'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            退出登录
          </button>
        </motion.div>
      </div>
    </div>
  )
}
