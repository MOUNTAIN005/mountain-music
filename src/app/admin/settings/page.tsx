'use client'

 import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
   const [settings, setSettings] = useState({
     siteTitle: '山影知道 | MOUNTAIN Music',
     siteDescription: '让声音记录灵魂 - 个人音乐艺术网站',
     siteKeywords: '音乐,个人音乐,山影知道,MOUNTAIN Music,原创音乐',
     logo: 'MOUNTAIN',
     logoSubtitle: 'MUSIC',
     bannerTitle: '让声音 记录灵魂',
     bannerSubtitle: '在旋律的海洋中，每一次振动都是灵魂的低语',
     email: 'hello@mountainmusic.com',
     github: '#',
     twitter: '#',
     icp: '',
   })
  const [saved, setSaved] = useState(false)
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)

   useEffect(() => {
     fetch('/api/settings').then(r => r.json()).then(d => {
       if (d.success && d.data) {
         setSettings(prev => ({ ...prev, ...d.data }))
       }
     }).finally(() => setLoading(false))
   }, [])

   const handleSave = async () => {
     setSaving(true)
     try {
       const r = await fetch('/api/settings', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(settings),
       })
       const d = await r.json()
       if (d.success) {
         setSaved(true)
         setTimeout(() => setSaved(false), 2000)
       }
     } catch {}
     setSaving(false)
   }

   if (loading) {
     return (
       <div>
         <h1 className="text-2xl font-bold text-gradient">网站设置</h1>
         <p className="text-gray-500 text-sm mt-1 mb-6">加载中...</p>
       </div>
     )
   }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">网站设置</h1>
        <p className="text-gray-500 text-sm mt-1">修改网站配置信息</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="p-6 rounded-2xl glass space-y-6">
          <h2 className="text-lg font-semibold">基本设置</h2>
          <div>
             <label className="block text-sm text-gray-400 mb-2">网站标题 / SEO 标题</label>
            <input type="text" value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
          </div>
          <div>
             <label className="block text-sm text-gray-400 mb-2">网站描述 / SEO 描述</label>
            <textarea rows={3} value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all resize-none" />
          </div>
           <div>
             <label className="block text-sm text-gray-400 mb-2">关键词 / SEO 关键词</label>
             <input type="text" value={settings.siteKeywords}
               onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" placeholder="用英文逗号分隔" />
           </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Logo 文字</label>
            <input type="text" value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
          </div>
           <div>
             <label className="block text-sm text-gray-400 mb-2">Logo 副标题</label>
             <input type="text" value={settings.logoSubtitle}
               onChange={(e) => setSettings({ ...settings, logoSubtitle: e.target.value })}
               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
           </div>
        </div>

        <div className="p-6 rounded-2xl glass space-y-6">
          <h2 className="text-lg font-semibold">Banner 设置</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-2">首页标题</label>
            <input type="text" value={settings.bannerTitle}
              onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">首页副标题</label>
            <textarea rows={3} value={settings.bannerSubtitle}
              onChange={(e) => setSettings({ ...settings, bannerSubtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all resize-none" />
          </div>
        </div>

        <div className="p-6 rounded-2xl glass space-y-6">
          <h2 className="text-lg font-semibold">联系与社交</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-2">邮箱</label>
            <input type="email" value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">GitHub</label>
              <input type="text" value={settings.github}
                onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Twitter</label>
              <input type="text" value={settings.twitter}
                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" />
            </div>
          </div>
        </div>

         <div className="p-6 rounded-2xl glass space-y-6">
           <h2 className="text-lg font-semibold">底部信息</h2>
           <div>
             <label className="block text-sm text-gray-400 mb-2">ICP 备案号</label>
             <input type="text" value={settings.icp}
               onChange={(e) => setSettings({ ...settings, icp: e.target.value })}
               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-purple/50 transition-all" placeholder="如 沪ICP备XXXXXXXX号" />
           </div>
         </div>

         <button onClick={handleSave} disabled={saving}
           className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
           <Save size={18} />
           {saving ? '保存中...' : saved ? '已保存' : '保存设置'}
         </button>
      </div>
    </div>
  )
}
