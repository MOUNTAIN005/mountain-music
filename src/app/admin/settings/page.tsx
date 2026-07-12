'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Save, CheckCircle } from 'lucide-react'

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState({ name: '', email: '' })
  const [original, setOriginal] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setAdmin({ name: d.data.name, email: d.data.email })
          setOriginal({ name: d.data.name, email: d.data.email })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveInfo = async () => {
    setSaving(true)
    try {
      const r = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      })
      const d = await r.json()
      if (d.success) {
        setOriginal({ ...admin })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch {}
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: '两次输入的密码不一致' })
      return
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: '新密码至少6个字符' })
      return
    }

    setPwLoading(true)
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const d = await r.json()
      if (d.success) {
        setPwMsg({ type: 'success', text: '密码修改成功' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPwMsg({ type: 'error', text: d.error || '修改失败' })
      }
    } catch {
      setPwMsg({ type: 'error', text: '修改失败，请重试' })
    }
    setPwLoading(false)
  }

  const hasChanges = admin.name !== original.name || admin.email !== original.email

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gradient">管理员信息</h1>
        <p className="text-gray-500 text-sm mt-1 mb-6">加载中...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-xl shadow-emerald-500/10"
          >
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-emerald-300">保存成功</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">管理员信息</h1>
        <p className="text-gray-500 text-sm mt-1">管理账户资料与密码</p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Admin Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass space-y-5"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User size={18} />
            账户资料
          </h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">管理员名称</label>
            <input type="text" value={admin.name}
              onChange={e => setAdmin(a => ({ ...a, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
              placeholder="管理员名称" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">邮箱</label>
            <input type="email" value={admin.email}
              onChange={e => setAdmin(a => ({ ...a, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
              placeholder="admin@example.com" />
          </div>

          <button onClick={handleSaveInfo} disabled={saving || !hasChanges}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            <Save size={18} />
            {saving ? '保存中...' : '保存信息'}
          </button>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl glass space-y-5"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock size={18} />
            修改密码
          </h2>

          {pwMsg.text && (
            <div className={`p-3 rounded-xl text-sm ${
              pwMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">当前密码</label>
              <input type="password" required value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="输入当前密码" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">新密码</label>
              <input type="password" required value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="至少6个字符" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">确认新密码</label>
              <input type="password" required value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all"
                placeholder="再次输入新密码" />
            </div>
            <button type="submit" disabled={pwLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
              <Lock size={18} />
              {pwLoading ? '修改中...' : '修改密码'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
