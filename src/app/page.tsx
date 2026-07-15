import HeroSection from '@/components/HeroSection'
import MusicRecommendation from '@/components/MusicRecommendation'
import MobileBottomPlayer from '@/components/MobileBottomPlayer'
import AlbumSection from '@/components/AlbumSection'
import StoriesSection from '@/components/StoriesSection'

export default function HomePage() {
  return (
    <div className="pb-20 lg:pb-0">
      {/* 1. Hero Section - 16:9 full screen */}
      <HeroSection />

      {/* 2. Music Recommendation - max-w-[1700px] centered */}
      <MusicRecommendation />

      {/* 3. Album Recommendation - max-w-[1700px] centered */}
      <AlbumSection />

      {/* 4. Stories Section - max-w-[1700px] centered */}
      <StoriesSection />

      <MobileBottomPlayer />
    </div>
  )
}
