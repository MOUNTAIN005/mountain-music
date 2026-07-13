'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, CheckCircle, Plus, Trash2, Music } from 'lucide-react'
import UploadField from '@/components/UploadField'

// Platform SVG icons
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

export default function AdminSocialsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPlatformName, setNewPlatformName] = useState('')
  const [footerTitle, setFooterTitle] = useState('MOUNTAIN MUSIC')
  const [footerDescription, setFooterDescription] = useState('让声音记录灵魂。\n这里是山影知道的个人音乐空间，\n用旋律讲述属于我们的故事。')

  useEffect(() => {
    fetch('/api/socials').then(r => r.json()).then(d => {
      if (d.success) {
        setItems(d.data || [])
      }
    }).finally(() => setLoading(false))

    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.success && d.data) {
        if (d.data.footerTitle) setFooterTitle(d.data.footerTitle)
        if (d.data.footerDescription) setFooterDescription(d.data.footerDescription)
      }
    }).catch(() => {})
  }, [])

  const updateItem = (platform: string, field: string, value: string) => {
    setItems(items.map(item => item.platform === platform ? { ...item, [field]: value } : item))
  }

  const deleteItem = async (platform: string) => {
    if (!confirm('确定删除此平台？')) return
    const item = items.find(i => i.platform === platform)
    if (item?.id) {
      try { await fetch(`/api/socials/${item.id}`, { method: 'DELETE' }) } catch {}
    }
    setItems(items.filter(i => i.platform !== platform))
  }

  const addPlatform = () => {
    if (!newPlatformName.trim()) return
    const key = newPlatformName.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '_')
    if (items.find(i => i.platform === key)) { alert('该平台已存在'); return }
    setItems([...items, { platform: key, name: newPlatformName.trim(), accountName: '', qrCodeUrl: '', sortOrder: items.length }])
    setNewPlatformName('')
    setShowAddForm(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/socials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }),
        fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ footerTitle, footerDescription }) }),
      ])
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch {}
    setSaving(false)
  }

  const saveFooter = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ footerTitle, footerDescription }) })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch {}
    setSaving(false)
  }

  const getIcon = (platform: string, size = 20) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons] || platformIcons._default
    return <Icon size={size} />
  }

  return (
    <div>
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-xl shadow-emerald-500/10">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-emerald-300">保存成功</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gradient">社交平台管理</h1>
          <p className="text-xs text-gray-500 mt-1">管理前台底部展示的社交平台信息</p>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="p-3 rounded-xl glass border border-white/5 space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">底部设置</h3>
          <button onClick={saveFooter} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white text-[10px] font-medium hover:shadow-lg disabled:opacity-50 transition-all">
            <Save size={12} />保存
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1.5">底部标题</label>
            <input value={footerTitle} onChange={e => setFooterTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50"
              placeholder="MOUNTAIN MUSIC" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1.5">底部描述文案</label>
            <textarea value={footerDescription} onChange={e => setFooterDescription(e.target.value)}
              rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50 resize-none"
              placeholder="让声音记录灵魂..." />
          </div>
        </div>
      </div>

      {/* Add Platform */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80">平台列表</h3>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-purple/15 border border-accent-purple/20 text-accent-purple text-xs font-medium hover:bg-accent-purple/25 transition-all">
          <Plus size={14} />添加平台
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl glass border border-accent-purple/20 mb-4">
            <div className="flex items-center gap-3">
              <input value={newPlatformName} onChange={e => setNewPlatformName(e.target.value)}
                placeholder="输入平台名称，如：B站、Spotify"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-purple/50"
                onKeyDown={e => e.key === 'Enter' && addPlatform()} />
              <button onClick={addPlatform} className="px-4 py-2 rounded-lg bg-accent-purple text-white text-xs font-medium hover:bg-accent-purple/90 transition-all">添加</button>
              <button onClick={() => { setShowAddForm(false); setNewPlatformName('') }} className="px-3 py-2 rounded-lg bg-white/10 text-gray-400 text-xs hover:bg-white/20 transition-all">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading ? (
          <p className="text-gray-500 text-sm py-8 text-center col-span-full">加载中...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <Music size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-2">暂无社交平台</p>
            <button onClick={() => setShowAddForm(true)} className="text-accent-purple text-xs hover:text-white transition-colors">点击添加</button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.platform} className="p-3 rounded-xl glass border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    {getIcon(item.platform, 14)}
                    </div>
                  <input
                    value={item.name}
                    onChange={e => updateItem(item.platform, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-[11px] font-medium focus:outline-none focus:border-accent-purple/50"
                    placeholder="平台"
                  />
                <button onClick={() => deleteItem(item.platform)}
                  className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0" title="删除此平台">
                  <Trash2 size={11} />
                </button>
              </div>

              <div>
                <UploadField
                  accept="image/*"
                  label={`${item.name}`}
                  onUpload={(url) => updateItem(item.platform, 'qrCodeUrl', url)}
                  currentUrl={item.qrCodeUrl || ''}
                  oldFileUrl={item.qrCodeUrl || ''}
                  preview
                >
                  {item.qrCodeUrl && (
                    <button onClick={() => updateItem(item.platform, 'qrCodeUrl', '')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all">
                      <Trash2 size={10} />删除图片
                    </button>
                  )}
                </UploadField>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <button onClick={save} disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all">
            <Save size={16} />{saving ? '保存中...' : '保存所有平台'}
          </button>
        </div>
      )}
    </div>
  )
}
