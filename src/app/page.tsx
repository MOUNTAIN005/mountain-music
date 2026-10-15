import Image from 'next/image'
import ThreeCDCarousel from '@/components/ThreeCDCarousel'

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f3f0]">
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hero-bg-right.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-50"
        />
      </div>
      <div className="relative z-10">
        <ThreeCDCarousel />
      </div>
    </div>
  )
}
