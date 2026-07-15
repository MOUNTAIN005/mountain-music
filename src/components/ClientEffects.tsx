'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientEffects() {
  const pathname = usePathname()
  const [showTransition, setShowTransition] = useState(true)

  // Smooth scroll (Lenis)
  useEffect(() => {
    let lenis: any = null
    async function initLenis() {
      try {
        const Lenis = (await import('lenis')).default
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
        })
        function raf(time: number) {
          lenis?.raf(time)
          requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)
      } catch {}
    }
    initLenis()
    return () => { lenis?.destroy() }
  }, [])

  // Page enter transition
  useEffect(() => {
    setShowTransition(true)
    const timer = setTimeout(() => setShowTransition(false), 400)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {/* Page enter overlay */}
      <div
        className="fixed inset-0 z-40 pointer-events-none bg-[#080808]"
        style={{
          opacity: showTransition ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />
    </>
  )
}
