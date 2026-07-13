'use client'

import { useEffect, useState } from 'react'

const plusIcon = (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="6.5" y1="0" x2="6.5" y2="13" stroke="currentColor" strokeWidth="1" />
    <line x1="13" y1="6.5" x2="0" y2="6.5" stroke="currentColor" strokeWidth="1" />
  </svg>
)

interface Plus {
  id: number; x: number; y: number; size: number; delay: number; duration: number; opacity: number
}

export default function FloatingPlus() {
  const [pluses, setPluses] = useState<Plus[]>([])

  useEffect(() => {
    const items: Plus[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 10 + Math.random() * 80,
      size: 8 + Math.random() * 8,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      opacity: 0.06 + Math.random() * 0.08,
    }))
    setPluses(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {pluses.map((p) => (
        <div
          key={p.id}
          className="absolute text-gray-500"
          style={{
            left: p.x + '%',
            top: p.y + '%',
            width: p.size,
            height: p.size,
            opacity: 0,
            animation: `float-plus ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {plusIcon}
        </div>
      ))}
    </div>
  )
}
