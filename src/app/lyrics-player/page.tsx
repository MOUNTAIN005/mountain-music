'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const LRC = `[00:04.032]秒针在滴答耳边回响
[00:07.460]对面关了最后一盏灯光
[00:11.232]午夜问着未来的模样
[00:14.070]该怎么编织属于自己的网
[00:31.778]我把心事藏进了耳机里
[00:33.735]让旋律陪我走过夜晚的安静
[00:35.403]那些没说出口，做的决心
[00:37.400]还有没完成的约定
[00:39.255]我知道这条路没有捷径
[00:41.519]有太多时候只能靠自己证明
[00:43.141]他们看不到我熬过的凌晨
[00:44.886]也不知道我咽下多少声音
[00:47.333]我曾经也怀疑过未来
[00:49.395]是不是开始远远离开
[00:51.165]可是每一次快要放弃相信
[00:53.784]总有个声音，不断给我信心
[01:01.804]如果时间能回答所有问题
[01:04.135]请一定要告诉自己
[01:06.497]经历过的那些孤寂
[01:12.603]最后都会成为勇气
[01:16.106]这是属于我的时间
[01:19.439]写满还没实现的梦，没圆
[01:23.241]哪怕世界太遥远，太多偏见
[01:27.643]不理会，我视而不见
[01:30.801]你们又不是我的未来
[01:32.480]从我世界离开，滚开
[01:34.441]I don't wanna lose my way
[01:36.268]I just wanna be okay
[01:38.113]把冷眼全都推开
[01:40.104]把遗憾留给昨天
[01:41.984]这是属于我的时间
[01:43.770]I build my own empire, following my plan.
[01:47.451]我走过没人看见的路
[01:49.266]也习惯了一个人领悟
[01:51.179]手机里保存那些记录
[01:52.794]提醒我别忘最初的温度
[01:54.789]别问我为什么总在坚持
[01:56.432]因为我不甘心这样认输
[01:58.247]不是每颗种子都会开花
[02:00.106]但每颗种子都努力破土
[02:02.269]我想带着家人的期待
[02:03.684]带着朋友给我的信赖
[02:05.548]穿过那些冷眼和无奈
[02:07.388]证明曾经的梦没有失败
[02:09.213]I keep moving, day by day
[02:10.831]把昨天全部都 rewrite
[02:12.667]未来不会自动到来
[02:14.372]所以我要自己 make my way
[02:16.442]这是属于我的时间
[02:18.638]写满对未来的期待
[02:21.859]已不是迷失的少年
[02:25.469]用尽全力编织着舞台
[02:29.442]I know we'll be alright
[02:31.683]Even in the darkest night
[02:33.896]就算我不是天空的star
[02:36.790]我也要让自己发出光明
[02:41.322]这是属于我的时间
[02:44.188]不会被任何人替代
[02:48.058]因为我用曾经的青春
[02:51.722]认真写下一段我的未来
[02:54.497]Our time, our story
[02:56.310]从黑夜走向黎明
[02:59.777]这一路的所有痕迹
[03:02.820]都是证明存在的肯定`

interface LyricLine { time: number; text: string }
interface Particle {
  char: string; lineIdx: number
  x: number; y: number
  baseX: number; baseY: number
  opacity: number; color: string; fontSize: number
  state: string; isStirred: boolean
}

function parseLRC(text: string): LyricLine[] {
  return text.split('\n').filter(l => l.trim()).map(line => {
    const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
    if (m) return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3].trim() }
    return null
  }).filter((l): l is LyricLine => l !== null && l.text.length > 0)
}

export default function LyricsPlayerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const lyRef = useRef<LyricLine[]>([])
  const rafRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastCSRef = useRef(-1)
  const curIdxRef = useRef(-1)

  const lyrics = parseLRC(LRC)
  lyRef.current = lyrics

  const isProtected = (li: number) => li === curIdxRef.current || li === curIdxRef.current - 1 || li === curIdxRef.current + 1
  const isFuture = (li: number, t: number) => lyRef.current[li]?.time > t
  const hasPlayed = (li: number, t: number) => lyRef.current[li].time + 2 <= t || (lyRef.current[li].time <= t && li < curIdxRef.current)

  const buildParticles = useCallback(() => {
    const ps: Particle[] = []
    lyrics.forEach((line, li) => {
      for (const ch of line.text) {
        if (ch === ' ') continue
        ps.push({
          char: ch, lineIdx: li,
          x: (Math.random() - 0.5) * 2 * (window.innerWidth * 0.42),
          y: (Math.random() - 0.5) * 2 * (window.innerHeight * 0.38),
          baseX: (Math.random() - 0.5) * 2 * (window.innerWidth * 0.42),
          baseY: (Math.random() - 0.5) * 2 * (window.innerHeight * 0.38),
          opacity: 0.06, color: '#3a3a5a', fontSize: 14,
          state: 'future', isStirred: false,
        })
      }
    })
    particlesRef.current = ps
  }, [lyrics])

  useEffect(() => { buildParticles() }, [buildParticles])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight

    ctx.clearRect(0, 0, W, H)
    ctx.save(); ctx.translate(W / 2, H / 2)

    particlesRef.current.forEach(p => {
      const li = p.lineIdx
      const isC = li === curIdxRef.current
      const isN = li === curIdxRef.current - 1 || li === curIdxRef.current + 1
      const isF = isFuture(li, time)
      const isP = hasPlayed(li, time)

      if (isC) { p.state = 'current'; p.opacity += (1 - p.opacity) * 0.08; p.color = '#c8b8ff'; p.fontSize = 16 }
      else if (isN) { p.state = 'near'; p.opacity += (0.55 - p.opacity) * 0.06; p.color = '#8a7aaa'; p.fontSize = 14 }
      else if (isF) { p.state = 'future'; p.opacity += (0.06 - p.opacity) * 0.03; p.color = '#3a3a5a'; p.fontSize = 13 }
      else if (p.isStirred) { p.state = 'stirred'; p.opacity += (0.1 - p.opacity) * 0.03; p.color = '#4a3a5a'; p.fontSize = 12 }
      else if (isP) { p.state = 'played'; p.opacity += (0.18 - p.opacity) * 0.05; p.color = '#5a4a7a'; p.fontSize = 12 }

      p.x += (p.baseX - p.x) * 0.06; p.y += (p.baseY - p.y) * 0.06

      ctx.save(); ctx.translate(p.x, p.y)
      ctx.globalAlpha = Math.max(0.02, p.opacity)
      ctx.fillStyle = p.color
      ctx.font = `${p.fontSize}px "PingFang SC","Microsoft YaHei",sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      if (p.state === 'current') { ctx.shadowColor = 'rgba(139,92,246,0.5)'; ctx.shadowBlur = 16 }
      else if (p.state === 'near') { ctx.shadowColor = 'rgba(139,92,246,0.15)'; ctx.shadowBlur = 6 }
      ctx.fillText(p.char, 0, 0); ctx.restore()
    })
    ctx.globalAlpha = 1; ctx.shadowBlur = 0

    const R = Math.min(W, H) * 0.09
    const g = ctx.createRadialGradient(0, 0, R - 3, 0, 0, R + 20)
    g.addColorStop(0, 'rgba(139,92,246,0.06)')
    g.addColorStop(0.5, 'rgba(139,92,246,0.08)')
    g.addColorStop(1, 'rgba(139,92,246,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R + 20, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(139,92,246,0.2)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2, m = i % 5 === 0
      const inn = R - (m ? 9 : 4), out = R - 2
      ctx.strokeStyle = m ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.1)'
      ctx.lineWidth = m ? 2 : 1; ctx.beginPath()
      ctx.moveTo(Math.cos(a) * inn, Math.sin(a) * inn)
      ctx.lineTo(Math.cos(a) * out, Math.sin(a) * out); ctx.stroke()
    }

    const hA = (time % 43200 / 43200) * Math.PI * 2 - Math.PI / 2
    const mA = (time % 3600 / 3600) * Math.PI * 2 - Math.PI / 2
    const sA = (time % 60 / 60) * Math.PI * 2 - Math.PI / 2
    const cs = time % 1, csA = cs * Math.PI * 2 - Math.PI / 2
    const csTick = Math.floor(cs * 100)
    if (csTick !== lastCSRef.current && csTick === 0) {
      lastCSRef.current = 0
      particlesRef.current.forEach(p => {
        if (isProtected(p.lineIdx) || !hasPlayed(p.lineIdx, time) || isFuture(p.lineIdx, time) || time - lyRef.current[p.lineIdx].time < 2) return
        p.isStirred = true
        p.baseX = (Math.random() - 0.5) * 2 * (window.innerWidth * 0.44)
        p.baseY = (Math.random() - 0.5) * 2 * (window.innerHeight * 0.41)
      })
    }
    lastCSRef.current = csTick

    const hands = [
      { a: hA, len: R * 0.28, w: 3.5, c: 'rgba(180,140,255,0.7)' },
      { a: mA, len: R * 0.40, w: 2.5, c: 'rgba(140,180,255,0.65)' },
      { a: sA, len: R * 0.52, w: 1.5, c: 'rgba(100,200,255,0.55)' },
      { a: csA, len: R * 0.62, w: 1, c: 'rgba(255,100,255,0.5)', glow: true },
    ]
    hands.forEach(h => {
      const ex = Math.cos(h.a) * h.len, ey = Math.sin(h.a) * h.len
      if (h.glow) { ctx.shadowColor = 'rgba(255,100,255,0.25)'; ctx.shadowBlur = 6 }
      ctx.strokeStyle = h.c; ctx.lineWidth = h.w; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.shadowBlur = 0
    })
    ctx.shadowColor = 'rgba(139,92,246,0.5)'; ctx.shadowBlur = 12
    ctx.fillStyle = '#c8b8ff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0; ctx.restore()
  }, [time])

  useEffect(() => {
    const tick = () => { draw(); rafRef.current = requestAnimationFrame(tick) }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else audio.play().catch(() => {})
    setPlaying(!playing)
  }

  const fmt = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0f', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <audio ref={audioRef} src="/songs/my-time.wav" preload="auto"
        onTimeUpdate={() => {
          const t = audioRef.current!.currentTime
          setTime(t)
          let idx = -1
          for (let i = lyRef.current.length - 1; i >= 0; i--) {
            if (t >= lyRef.current[i].time && t < (lyRef.current[i + 1]?.time || Infinity)) { idx = i; break }
          }
          if (t >= lyRef.current[lyRef.current.length - 1].time) idx = lyRef.current.length - 1
          if (idx >= 0) { curIdxRef.current = idx; setCurrentLine(idx) }
        }}
        onLoadedMetadata={() => setDuration(audioRef.current!.duration)}
        onEnded={() => setPlaying(false)}
      />

      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(8px)',
        padding: '8px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 12, color: '#888',
      }}>
        <button onClick={togglePlay} style={{
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
          color: '#c8b8ff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{playing ? '\u23f8' : '\u25b6'}</button>

        <span style={{ minWidth: 80, textAlign: 'center' }}>{fmt(time)} / {fmt(duration)}</span>

        {currentLine >= 0 && (
          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#555' }}>
            {lyrics[currentLine]?.text?.substring(0, 25)}
          </span>
        )}
      </div>
    </div>
  )
}
