import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const REVALIDATE_SECONDS = 60

export const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
}

export const getHeroData = unstable_cache(
  async () => {
    const setting = await prisma.setting.findUnique({ where: { key: 'hero_data' } })
    return setting ? JSON.parse(setting.value) : null
  },
  ['public', 'settings-hero'],
  { revalidate: REVALIDATE_SECONDS, tags: ['settings'] },
)

export const getSettingsMap = unstable_cache(
  async () => {
    const settings = await prisma.setting.findMany()
    return settings.reduce(
      (result: Record<string, string>, item) => ({ ...result, [item.key]: item.value }),
      {},
    )
  },
  ['public', 'settings'],
  { revalidate: REVALIDATE_SECONDS, tags: ['settings'] },
)

export const getSocialLinks = unstable_cache(
  async () => prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } }),
  ['public', 'socials'],
  { revalidate: REVALIDATE_SECONDS, tags: ['socials'] },
)

export function getAlbums(showAll: boolean) {
  return unstable_cache(
    async () =>
      prisma.album.findMany({
        where: showAll ? {} : { isPublished: true },
        include: { songs: true },
        orderBy: { createdAt: 'desc' },
      }),
    ['public', 'albums', showAll ? 'all' : 'published'],
    { revalidate: REVALIDATE_SECONDS, tags: ['albums'] },
  )()
}

export function getStories(showAll: boolean) {
  return unstable_cache(
    async () =>
      prisma.story.findMany({
        where: showAll ? {} : { status: 'approved', isDisplayed: true },
        orderBy: { createdAt: 'desc' },
        include: { song: true },
      }),
    ['public', 'stories', showAll ? 'all' : 'published'],
    { revalidate: REVALIDATE_SECONDS, tags: ['stories'] },
  )()
}

export function getSongs(recommended: boolean) {
  return unstable_cache(
    async () =>
      prisma.song.findMany({
        where: recommended ? { isPublished: true, isRecommended: true } : {},
        orderBy: recommended
          ? { updatedAt: 'desc' }
          : [{ isRecommended: 'desc' }, { createdAt: 'desc' }],
        include: { album: true },
      }),
    ['public', 'songs', recommended ? 'recommended' : 'all'],
    { revalidate: REVALIDATE_SECONDS, tags: ['songs'] },
  )()
}

export const getRankingSongs = unstable_cache(
  async () =>
    prisma.song.findMany({
      where: { isPublished: true },
      orderBy: { playCount: 'desc' },
      take: 10,
    }),
  ['public', 'ranking'],
  { revalidate: REVALIDATE_SECONDS, tags: ['songs'] },
)
