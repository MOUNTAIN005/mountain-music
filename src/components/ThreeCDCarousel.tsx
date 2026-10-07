'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { Song } from '@/types'

export interface ThreeCDCarouselItem {
  id: string | number
  title: string
  meta: string
  image?: string | null
  description?: string | null
  song?: Song
}

interface ThreeCDCarouselProps {
  items?: ThreeCDCarouselItem[]
  className?: string
}

const fallbackItems: ThreeCDCarouselItem[] = [
  { id: 1, title: 'The Last Signal', meta: 'MOUNTAIN MUSIC', image: null, description: '让声音停留在山谷与城市之间。' },
  { id: 2, title: 'Night Archive', meta: 'MOUNTAIN MUSIC', image: null, description: '夜晚之后，旋律仍在缓慢发光。' },
  { id: 3, title: 'Somewhere in Time', meta: 'MOUNTAIN MUSIC', image: null, description: '一段关于远行与归途的声音。' },
  { id: 4, title: 'After the Rain', meta: 'MOUNTAIN MUSIC', image: null, description: '把日常写成一段可以回放的旋律。' },
  { id: 5, title: 'Final Scene', meta: 'MOUNTAIN MUSIC', image: null, description: '每一段回声，都值得被认真收藏。' },
]

const LOOP_CYCLES = 9
const LOOP_EDGE_CYCLES = 2

const fallbackGradients = [
  ['#75dcff', '#3979ff'],
  ['#ffd075', '#ff8a3d'],
  ['#ff7acb', '#8a66ff'],
  ['#8eea94', '#29b9a4'],
  ['#ff8a8a', '#f06336'],
]

const apiFileUrl = (url: string | null | undefined) => {
  if (!url) return null
  return url.startsWith('/uploads/') ? url.replace('/uploads/', '/api/uploads/') : url
}

const optimizedImageUrl = (url: string | null | undefined) => {
  if (!url) return null
  if (url.startsWith('/')) return url
  return `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=78`
}

function drawDiscInfo(
  context: CanvasRenderingContext2D,
  item: ThreeCDCarouselItem,
) {
  context.textAlign = 'center'
  context.shadowColor = 'rgba(0,0,0,0.72)'
  context.shadowBlur = 18
  context.shadowOffsetY = 3
  context.fillStyle = 'rgba(255,255,255,0.96)'
  context.font = '700 66px sans-serif'
  context.fillText(item.title.toUpperCase().slice(0, 18), 512, 742)
  context.font = '500 38px sans-serif'
  context.fillText(item.meta.toUpperCase().slice(0, 28), 512, 806)
  context.shadowBlur = 0
  context.shadowOffsetY = 0
}

function makeFallbackTexture(item: ThreeCDCarouselItem, index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  if (!context) return texture

  const [from, to] = fallbackGradients[index % fallbackGradients.length]
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, from)
  gradient.addColorStop(1, to)
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawDiscInfo(context, item)
  texture.needsUpdate = true
  return texture
}

function makeInfoTexture(item: ThreeCDCarouselItem) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawDiscInfo(context, item)
    texture.needsUpdate = true
  }
  return texture
}

function makeCaseReflectionTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  if (!context) return texture

  const diagonal = context.createLinearGradient(40, 0, 470, 512)
  diagonal.addColorStop(0, 'rgba(255,255,255,0.5)')
  diagonal.addColorStop(0.16, 'rgba(255,255,255,0.12)')
  diagonal.addColorStop(0.34, 'rgba(255,255,255,0)')
  diagonal.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = diagonal
  context.fillRect(0, 0, 512, 512)

  context.lineWidth = 8
  context.strokeStyle = 'rgba(255,255,255,0.34)'
  context.beginPath()
  context.moveTo(18, 58)
  context.lineTo(454, 0)
  context.stroke()

  context.lineWidth = 4
  context.strokeStyle = 'rgba(255,255,255,0.22)'
  context.beginPath()
  context.moveTo(0, 492)
  context.lineTo(512, 302)
  context.stroke()

  texture.needsUpdate = true
  return texture
}

function parseLyrics(text: string | null | undefined) {
  if (!text) return []

  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/)
      if (match) {
        return {
          time: parseInt(match[1]) * 60 + parseFloat(match[2]),
          text: match[3].trim(),
        }
      }
      return { time: 0, text: line.trim() }
    })
    .filter((line) => line.text)
}

function cubicPoint(u: number, curveX: number, curveY: number) {
  const oneMinusU = 1 - u
  return {
    x:
      oneMinusU ** 3 * curveX
      + 3 * oneMinusU ** 2 * u * -curveX * 0.34
      + 3 * oneMinusU * u ** 2 * curveX * 0.34
      + u ** 3 * -curveX,
    y:
      oneMinusU ** 3 * -curveY
      + 3 * oneMinusU ** 2 * u * -curveY * 0.42
      + 3 * oneMinusU * u ** 2 * curveY * 0.42
      + u ** 3 * curveY,
  }
}

function getInfoPanelCoverage(
  centerX: number,
  centerY: number,
  radius: number,
  panelRect: DOMRect | null,
) {
  if (!panelRect || radius <= 0) return 0

  const overlapWidth = Math.max(
    0,
    Math.min(centerX + radius, panelRect.right) - Math.max(centerX - radius, panelRect.left),
  )
  const overlapHeight = Math.max(
    0,
    Math.min(centerY + radius, panelRect.bottom) - Math.max(centerY - radius, panelRect.top),
  )
  const overlapArea = overlapWidth * overlapHeight
  const discArea = Math.PI * radius * radius

  return Math.min(1, overlapArea / (discArea * 0.55))
}

function getLoopOffset(index: number, smoothIndex: number, itemCount: number) {
  const wrappedOffset = ((index - smoothIndex) % itemCount + itemCount) % itemCount
  return wrappedOffset > itemCount / 2 ? wrappedOffset - itemCount : wrappedOffset
}

function getWrappedIndex(index: number, itemCount: number) {
  return ((index % itemCount) + itemCount) % itemCount
}

export default function ThreeCDCarousel({
  items,
  className = '',
}: ThreeCDCarouselProps) {
  const [fetchedItems, setFetchedItems] = useState<ThreeCDCarouselItem[] | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollFrame = useRef<number | null>(null)
  const isRecenteringRef = useRef(false)
  const targetIndexRef = useRef(0)
  const smoothIndexRef = useRef(0)
  const wakeRenderRef = useRef<() => void>(() => {})
  const discButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const isPlayingRef = useRef(false)
  const playingSongIdRef = useRef<string | number | null>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)
  const displayItems = items ?? fetchedItems ?? fallbackItems
  const { play, currentSong, isPlaying, currentTime, pause, resume } = useAudioPlayer()

  useEffect(() => {
    if (items) return

    const mapSongs = (songs: Partial<Song>[]) => songs.slice(0, 5).map((song, index) => {
      const id = typeof song.id === 'number' ? song.id : -(400 + index)
      const coverUrl = apiFileUrl(song.coverUrl)
      const audioUrl = apiFileUrl(song.audioUrl) || ''

      return {
        id,
        title: song.title || fallbackItems[index % fallbackItems.length].title,
        meta: song.artist || 'MOUNTAIN MUSIC',
        image: optimizedImageUrl(coverUrl),
        description: song.description || fallbackItems[index % fallbackItems.length].description,
        song: {
          ...fallbackItems[0].song,
          ...song,
          id,
          title: song.title || fallbackItems[index % fallbackItems.length].title,
          artist: song.artist || 'MOUNTAIN MUSIC',
          coverUrl,
          audioUrl,
          lyrics: song.lyrics || null,
          description: song.description || null,
        } as Song,
      }
    })

    const loadItems = async () => {
      try {
        const recommendedResponse = await fetch('/api/recommended-songs')
        const recommendedResult = await recommendedResponse.json()
        if (recommendedResult.success && Array.isArray(recommendedResult.data) && recommendedResult.data.length > 0) {
          setFetchedItems(mapSongs(recommendedResult.data))
          return
        }

        const albumsResponse = await fetch('/api/albums')
        const albumsResult = await albumsResponse.json()
        if (!albumsResult.success || !Array.isArray(albumsResult.data)) return

        const albumSongs = albumsResult.data
          .flatMap((album: { coverUrl?: string | null; songs?: Partial<Song>[] }) =>
            (album.songs || []).map((song) => ({
              ...song,
              coverUrl: song.coverUrl || album.coverUrl || null,
            })),
          )
          .filter((song: Partial<Song>) => song.title)

        if (albumSongs.length > 0) setFetchedItems(mapSongs(albumSongs))
      } catch {}
    }

    loadItems()
  }, [items])

  const goTo = useCallback((index: number) => {
    const node = scrollRef.current
    if (!node || displayItems.length === 0) return

    const itemCount = displayItems.length
    const targetIndex = getWrappedIndex(index, itemCount)
    const currentIndex = targetIndexRef.current
    const currentWrappedIndex = getWrappedIndex(Math.round(currentIndex), itemCount)
    let delta = targetIndex - currentWrappedIndex

    if (delta > itemCount / 2) delta -= itemCount
    if (delta < -itemCount / 2) delta += itemCount

    const nextIndex = currentIndex + delta
    node.scrollTo({ top: nextIndex * node.clientHeight, behavior: 'smooth' })
  }, [displayItems.length])

  const handleScroll = () => {
    if (scrollFrame.current !== null) return

    scrollFrame.current = window.requestAnimationFrame(() => {
      scrollFrame.current = null
      const node = scrollRef.current
      if (!node || displayItems.length < 2) return
      if (isRecenteringRef.current) return

      const itemCount = displayItems.length
      const pageIndex = node.scrollTop / node.clientHeight
      const minPage = itemCount * LOOP_EDGE_CYCLES
      const maxPage = itemCount * (LOOP_CYCLES - LOOP_EDGE_CYCLES)

      if (pageIndex < minPage || pageIndex > maxPage) {
        // Shift by complete cycles so the wrapped view stays visually identical.
        const shift = pageIndex < minPage
          ? itemCount * LOOP_EDGE_CYCLES
          : -itemCount * LOOP_EDGE_CYCLES

        targetIndexRef.current += shift
        smoothIndexRef.current += shift
        isRecenteringRef.current = true
        node.scrollTo({ top: (pageIndex + shift) * node.clientHeight, behavior: 'instant' })
        window.requestAnimationFrame(() => {
          isRecenteringRef.current = false
        })
        wakeRenderRef.current()
        return
      }

      targetIndexRef.current = pageIndex
      setActiveIndex(getWrappedIndex(Math.round(pageIndex), itemCount))
      wakeRenderRef.current()
    })
  }

  useEffect(() => {
    const node = scrollRef.current
    if (!node || displayItems.length < 2) return

    const itemCount = displayItems.length
    const centerIndex = Math.floor(itemCount / 2)
    const centerPage = Math.floor(LOOP_CYCLES / 2) * itemCount + centerIndex
    const frame = window.requestAnimationFrame(() => {
      node.scrollTo({ top: centerPage * node.clientHeight, behavior: 'instant' })
      targetIndexRef.current = centerPage
      smoothIndexRef.current = centerPage
      setActiveIndex(centerIndex)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [displayItems.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container || displayItems.length === 0) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 11.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(renderer.domElement)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const roomEnvironment = new RoomEnvironment()
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture
    scene.environmentIntensity = 0.72
    roomEnvironment.dispose()

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5)
    keyLight.position.set(4, 5, 7)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -8
    keyLight.shadow.camera.right = 8
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.bias = -0.0003
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0xd8eaff, 12, 18, 2)
    rimLight.position.set(-5, 3, 6)
    scene.add(rimLight)

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 12),
      new THREE.ShadowMaterial({ color: 0x111111, opacity: 0.1 }),
    )
    shadowPlane.position.z = -0.55
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    const sceneRoot = new THREE.Group()
    scene.add(sceneRoot)

    const discGeometry = new THREE.RingGeometry(0.12, 1.3, 160, 1)
    const rimGeometry = new THREE.RingGeometry(1.275, 1.315, 160, 1)
    const hubGeometry = new THREE.RingGeometry(0.12, 0.34, 128, 1)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xf7f8fa,
      metalness: 0.04,
      roughness: 0.34,
      envMapIntensity: 0.65,
      side: THREE.DoubleSide,
    })
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd7dbe0,
      metalness: 0.96,
      roughness: 0.12,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
    })
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0xf2f4f6,
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 0.78,
      side: THREE.DoubleSide,
    })
    const caseBackMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const caseEdgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8f1f7,
      metalness: 0.08,
      roughness: 0.08,
      transparent: true,
      opacity: 0.62,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.25,
      side: THREE.DoubleSide,
    })
    const caseTrayMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x27313b,
      metalness: 0.08,
      roughness: 0.3,
      transmission: 0.18,
      thickness: 0.24,
      transparent: true,
      opacity: 0.44,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
      side: THREE.DoubleSide,
    })
    const caseShellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.06,
      transmission: 0.86,
      thickness: 0.2,
      ior: 1.46,
      transparent: true,
      opacity: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      envMapIntensity: 1.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const caseRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const caseBackGeometry = new THREE.PlaneGeometry(3.1, 2.86)
    const caseEdgeHorizontalGeometry = new THREE.BoxGeometry(3.12, 0.14, 0.16)
    const caseEdgeVerticalGeometry = new THREE.BoxGeometry(0.14, 2.86, 0.16)
    const caseSpineGeometry = new THREE.BoxGeometry(0.22, 2.96, 0.2)
    const caseTrayGeometry = new RoundedBoxGeometry(3.08, 2.84, 0.1, 5, 0.08)
    const caseShellGeometry = new RoundedBoxGeometry(3.15, 2.91, 0.12, 6, 0.1)
    const caseRingGeometry = new THREE.RingGeometry(0.42, 1.08, 96, 1)
    const hingeGeometry = new THREE.CylinderGeometry(0.048, 0.048, 0.34, 16)
    const caseReflectionTexture = makeCaseReflectionTexture()
    const caseReflectionMaterial = new THREE.MeshBasicMaterial({
      map: caseReflectionTexture,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const caseReflectionGeometry = new THREE.PlaneGeometry(3.02, 2.8)

    const caseGroup = new THREE.Group()
    const sourcePoint = cubicPoint(0, 3.2, 1.85)
    caseGroup.position.set(sourcePoint.x, sourcePoint.y, -1.86)
    caseGroup.rotation.set(-0.08, -0.26, -0.37)
    caseGroup.scale.setScalar(0.82)
    caseGroup.renderOrder = -1
    sceneRoot.add(caseGroup)

    const caseBack = new THREE.Mesh(caseBackGeometry, caseBackMaterial)
    caseBack.position.z = 0
    caseBack.receiveShadow = true
    caseGroup.add(caseBack)

    const caseTray = new THREE.Mesh(caseTrayGeometry, caseTrayMaterial)
    caseTray.position.z = -0.08
    caseTray.receiveShadow = true
    caseGroup.add(caseTray)

    const caseRing = new THREE.Mesh(caseRingGeometry, caseRingMaterial)
    caseRing.position.z = 0.04
    caseRing.renderOrder = 1
    caseGroup.add(caseRing)

    const caseShell = new THREE.Mesh(caseShellGeometry, caseShellMaterial)
    caseShell.position.z = 0.14
    caseShell.renderOrder = 2
    caseGroup.add(caseShell)

    const caseReflection = new THREE.Mesh(caseReflectionGeometry, caseReflectionMaterial)
    caseReflection.position.z = 0.22
    caseReflection.renderOrder = 3
    caseGroup.add(caseReflection)

    const topEdge = new THREE.Mesh(caseEdgeHorizontalGeometry, caseEdgeMaterial)
    topEdge.position.set(0, 1.43, 0.02)
    topEdge.castShadow = true
    caseGroup.add(topEdge)

    const bottomEdge = new THREE.Mesh(caseEdgeHorizontalGeometry, caseEdgeMaterial)
    bottomEdge.position.set(0, -1.43, 0.02)
    bottomEdge.castShadow = true
    caseGroup.add(bottomEdge)

    const leftEdge = new THREE.Mesh(caseEdgeVerticalGeometry, caseEdgeMaterial)
    leftEdge.position.set(-1.51, 0, 0.02)
    leftEdge.castShadow = true
    caseGroup.add(leftEdge)

    const rightEdge = new THREE.Mesh(caseEdgeVerticalGeometry, caseEdgeMaterial)
    rightEdge.position.set(1.51, 0, 0.02)
    rightEdge.castShadow = true
    caseGroup.add(rightEdge)

    const spine = new THREE.Mesh(caseSpineGeometry, caseEdgeMaterial)
    spine.position.set(1.58, 0, -0.04)
    spine.castShadow = true
    caseGroup.add(spine)

    for (const y of [-0.88, 0, 0.88]) {
      const hinge = new THREE.Mesh(hingeGeometry, caseEdgeMaterial)
      hinge.position.set(1.64, y, -0.02)
      hinge.rotation.z = Math.PI / 2
      hinge.castShadow = true
      caseGroup.add(hinge)
    }
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    const groups: THREE.Group[] = []
    const coverTextures: THREE.Texture[] = []
    const disposeItems: Array<() => void> = []

    displayItems.forEach((item, index) => {
      const group = new THREE.Group()
      group.userData.index = index
      group.userData.distance = 0
      groups.push(group)

      const texture = item.image
        ? textureLoader.load(item.image, () => wakeRenderRef.current())
        : makeFallbackTexture(item, index)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      if (!item.image) texture.needsUpdate = true
      coverTextures[index] = texture
      const infoTexture = makeInfoTexture(item)

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
      })

      const baseMaterial = ringMaterial.clone()
      const rimEdgeMaterial = rimMaterial.clone()
      const centerHubMaterial = hubMaterial.clone()
      baseMaterial.transparent = true
      rimEdgeMaterial.transparent = true
      centerHubMaterial.transparent = true

      const baseDisc = new THREE.Mesh(discGeometry, baseMaterial)
      baseDisc.position.z = 0
      baseDisc.receiveShadow = true
      group.add(baseDisc)

      const disc = new THREE.Mesh(discGeometry, material)
      disc.position.z = 0.012
      disc.castShadow = true
      disc.receiveShadow = true
      group.userData.discMesh = disc
      group.add(disc)

      const infoMaterial = new THREE.MeshBasicMaterial({
        map: infoTexture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      const info = new THREE.Mesh(discGeometry, infoMaterial)
      info.position.z = 0.032
      info.renderOrder = 2
      group.add(info)

      const rim = new THREE.Mesh(rimGeometry, rimEdgeMaterial)
      rim.position.z = 0.018
      rim.castShadow = true
      group.add(rim)

      const hub = new THREE.Mesh(hubGeometry, centerHubMaterial)
      hub.position.z = 0.026
      hub.castShadow = true
      group.add(hub)

      group.rotation.order = 'XYZ'
      group.userData.materials = [baseMaterial, rimEdgeMaterial, centerHubMaterial, material, infoMaterial]
      sceneRoot.add(group)
      disposeItems.push(() => {
        baseMaterial.dispose()
        rimEdgeMaterial.dispose()
        centerHubMaterial.dispose()
        material.dispose()
        texture.dispose()
        infoMaterial.dispose()
        infoTexture.dispose()
      })
    })

    let animationFrame = 0
    let running = false
    let lastFrameTime = performance.now()
    let infoPanelRect: DOMRect | null = null

    const updateInfoPanelRect = () => {
      infoPanelRect = infoPanelRef.current?.getBoundingClientRect() ?? null
    }

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return

      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.position.z = width < 640 ? 14.8 : 12.4
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      sceneRoot.position.set(width < 640 ? 0.62 : 1.5, -0.04, 0)
      updateInfoPanelRect()
      wakeRenderRef.current()
    }

    const resizeObserver = new ResizeObserver(resize)
    const infoPanelResizeObserver = new ResizeObserver(updateInfoPanelRect)
    resizeObserver.observe(container)
    if (infoPanelRef.current) infoPanelResizeObserver.observe(infoPanelRef.current)
    resize()

    const render = () => {
      const now = performance.now()
      const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.05)
      lastFrameTime = now
      const difference = targetIndexRef.current - smoothIndexRef.current
      smoothIndexRef.current += difference * 0.085
      if (Math.abs(difference) < 0.0005) smoothIndexRef.current = targetIndexRef.current
      const projectedPosition = new THREE.Vector3()
      const playbackActive = isPlayingRef.current && playingSongIdRef.current !== null
      const projectedDiscs: Array<{
        index: number
        distance: number
        depth: number
        opacity: number
        visible: boolean
        coverage: number
        screenX: number
        screenY: number
        radius: number
      }> = []

      groups.forEach((group, index) => {
        const offset = getLoopOffset(index, smoothIndexRef.current, displayItems.length)
        const distance = Math.abs(offset)
        const u = (2 - offset) / 4
        const point = cubicPoint(u, 3.2, 1.85)
        const revealProgress = Math.max(0, Math.min(1, (2 - offset) / 0.72))
        const edgeFade = distance > 2.7 ? Math.max(0, 1 - (distance - 2.7) * 0.72) : 1
        const focus = Math.max(0, 1 - distance * 0.36)

        if (index === 0) {
          const caseIndex = getWrappedIndex(Math.round(smoothIndexRef.current) + 2, displayItems.length)
          const caseTexture = coverTextures[caseIndex]
          if (caseTexture && caseBackMaterial.map !== caseTexture) {
            caseBackMaterial.map = caseTexture
            caseBackMaterial.needsUpdate = true
          }
        }

        group.position.set(point.x, point.y, -distance * 0.86)
        group.scale.setScalar(0.72 + focus * 0.36)
        group.rotation.x = -0.08 + Math.sin(u * Math.PI) * 0.07
        group.rotation.y = (u - 0.5) * 0.52
        group.rotation.z = -0.16 + (u - 0.5) * 0.42
        group.updateWorldMatrix(true, false)

        group.getWorldPosition(projectedPosition)
        const worldZ = projectedPosition.z
        projectedPosition.z += 0.08
        projectedPosition.project(camera)
        const screenX = (projectedPosition.x * 0.5 + 0.5) * container.clientWidth
        const screenY = (-projectedPosition.y * 0.5 + 0.5) * container.clientHeight
        const cameraDistance = Math.max(1, camera.position.z - worldZ)
        const radius = group.scale.x * 1.3
          * (container.clientHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cameraDistance))
        const coverage = getInfoPanelCoverage(screenX, screenY, radius, infoPanelRect)
        const opacity = revealProgress * edgeFade * (1 - coverage * 0.7)
        const visible = opacity > 0.01

        group.visible = visible
        const materialList = group.userData.materials as THREE.Material[]
        materialList.forEach((entry) => {
          entry.transparent = true
          entry.opacity = opacity
        })

        if (playbackActive && displayItems[index]?.song?.id === playingSongIdRef.current) {
          const discMesh = group.userData.discMesh as THREE.Mesh | undefined
          if (discMesh) discMesh.rotation.z -= deltaSeconds * 1.35
        }

        projectedDiscs.push({
          index,
          distance,
          depth: group.position.z,
          opacity,
          visible,
          coverage,
          screenX,
          screenY,
          radius,
        })
      })

      projectedDiscs.forEach((disc) => {
        const button = discButtonRefs.current[disc.index]
        if (!button) return

        const buttonScale = 0.82 + Math.max(0, 1 - disc.distance * 0.36) * 0.32
        const buttonRadius = 22 * buttonScale
        const occluded = projectedDiscs.some((other) => (
          other.index !== disc.index
          && other.visible
          && other.depth > disc.depth + 0.02
          && Math.hypot(other.screenX - disc.screenX, other.screenY - disc.screenY)
            < other.radius + buttonRadius * 0.18
        ))
        const buttonOpacity = disc.opacity * Math.max(0.28, 1 - Math.max(0, disc.distance - 1.8) * 0.48)
        const showButton = disc.visible && !occluded && disc.coverage < 0.62

        button.style.opacity = showButton ? String(buttonOpacity) : '0'
        button.style.pointerEvents = showButton && buttonOpacity > 0.2 && disc.coverage < 0.2 ? 'auto' : 'none'
        button.style.zIndex = String(80 + Math.round(disc.depth * 20))
        button.style.transform = `translate3d(${disc.screenX}px, ${disc.screenY}px, 0) translate(-50%, -50%) scale(${buttonScale})`
      })

      renderer.render(scene, camera)
      if (Math.abs(targetIndexRef.current - smoothIndexRef.current) > 0.0005 || playbackActive) {
        animationFrame = window.requestAnimationFrame(render)
      } else {
        running = false
      }
    }

    const wakeRender = () => {
      if (running) return
      running = true
      animationFrame = window.requestAnimationFrame(render)
    }

    wakeRenderRef.current = wakeRender
    wakeRender()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      wakeRenderRef.current = () => {}
      resizeObserver.disconnect()
      infoPanelResizeObserver.disconnect()
      groups.forEach((group) => sceneRoot.remove(group))
      sceneRoot.remove(caseGroup)
      scene.remove(sceneRoot)
      disposeItems.forEach((dispose) => dispose())
      discGeometry.dispose()
      rimGeometry.dispose()
      hubGeometry.dispose()
      ringMaterial.dispose()
      rimMaterial.dispose()
      hubMaterial.dispose()
      caseBackGeometry.dispose()
      caseEdgeHorizontalGeometry.dispose()
      caseEdgeVerticalGeometry.dispose()
      caseSpineGeometry.dispose()
      caseBackMaterial.dispose()
      caseEdgeMaterial.dispose()
      caseTrayGeometry.dispose()
      caseShellGeometry.dispose()
      caseRingGeometry.dispose()
      hingeGeometry.dispose()
      caseReflectionGeometry.dispose()
      caseReflectionTexture.dispose()
      caseTrayMaterial.dispose()
      caseShellMaterial.dispose()
      caseRingMaterial.dispose()
      caseReflectionMaterial.dispose()
      shadowPlane.geometry.dispose()
      shadowPlane.material.dispose()
      pmremGenerator.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [displayItems])

  useEffect(() => () => {
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
  }, [])

  useEffect(() => {
    isPlayingRef.current = isPlaying
    playingSongIdRef.current = currentSong?.id ?? null
    wakeRenderRef.current()
  }, [currentSong?.id, isPlaying])

  const activeItem = displayItems[activeIndex] || displayItems[0]
  const playingItem = currentSong
    ? displayItems.find((item) => item.song?.id === currentSong.id)
    : undefined
  const infoItem = playingItem || activeItem
  const infoSong = infoItem.song
  const isInfoPlaying = !!infoSong && currentSong?.id === infoSong.id && isPlaying
  const lyricLines = parseLyrics(infoSong?.lyrics)
  const lyricIndex = isInfoPlaying
    ? lyricLines.findLastIndex((line) => currentTime >= line.time)
    : -1
  const currentLyric = lyricIndex >= 0 ? lyricLines[lyricIndex]?.text : ''

  const toggleSong = (item: ThreeCDCarouselItem, index?: number) => {
    const song = item.song
    if (!song?.audioUrl) return

    if (typeof index === 'number') goTo(index)

    if (currentSong?.id === song.id && isPlaying) {
      pause()
      return
    }
    if (currentSong?.id === song.id && !isPlaying) {
      resume()
      return
    }
    play(song)
  }

  return (
    <section className={`relative h-screen overflow-hidden bg-[#f3f3f0] text-[#0a0a0a] ${className}`}>
      <div
        ref={scrollRef}
        data-lenis-prevent
        onScroll={handleScroll}
        className="no-scrollbar relative h-screen snap-y snap-mandatory overflow-y-scroll"
      >
        <div className="sticky top-0 h-screen snap-start snap-always overflow-hidden">
          <div ref={containerRef} className="absolute inset-0 z-10" />

          <div
            ref={infoPanelRef}
            className="pointer-events-none absolute left-5 top-[76px] z-30 w-[66vw] max-w-[260px] translate-x-0 sm:left-10 sm:top-28 sm:w-[80vw] sm:max-w-[360px] sm:translate-x-[20%] lg:top-32"
          >
            <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-black/45 sm:mb-2 sm:text-[10px] sm:tracking-[0.24em]">
              {isInfoPlaying ? 'Now Playing' : 'Now Selected'}
            </p>
            <h1 className="w-full break-words text-[26px] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl">
              {infoItem.title}
            </h1>
            <p className="mt-2 w-full break-words text-[10px] uppercase tracking-[0.16em] text-black/45 sm:mt-3 sm:text-xs sm:tracking-[0.18em]">{infoItem.meta}</p>
            {infoItem.description && (
              <p className="mt-3 w-full break-words text-[11px] leading-relaxed text-black/50 sm:mt-5 sm:text-xs">
                {infoItem.description}
              </p>
            )}
            <div className="mt-5 space-y-1.5 text-[9px] uppercase tracking-[0.14em] text-black/40 sm:mt-8 sm:space-y-2 sm:text-[10px] sm:tracking-[0.16em]">
              <div className="flex justify-between gap-4 border-t border-black/15 pt-2 sm:gap-10">
                <span>Artist</span>
                <span className="min-w-0 truncate text-right">{infoItem.meta}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-black/15 pt-2 sm:gap-10">
                <span>Format</span>
                <span>Compact Disc</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleSong(infoItem, displayItems.indexOf(infoItem))}
              disabled={!infoSong?.audioUrl}
              className="pointer-events-auto mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-4 text-xs font-medium text-white transition hover:scale-[1.03] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30 sm:mt-7 sm:h-12 sm:gap-3 sm:px-5 sm:text-sm"
            >
              {isInfoPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
              {isInfoPlaying ? '暂停播放' : '播放歌曲'}
            </button>
          </div>

          <div className="pointer-events-none absolute left-5 top-[330px] z-30 w-[66vw] max-w-[260px] translate-x-0 overflow-hidden border-l-2 border-black/10 pl-3 sm:left-10 sm:top-[458px] sm:w-[80vw] sm:max-w-[320px] sm:translate-x-[20%] sm:pl-4 lg:top-[474px]">
            <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-black/35">Lyrics</p>
            <div className="h-12 w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {currentLyric ? (
                  <motion.p
                    key={`${infoSong?.id}-${lyricIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className="w-full break-words text-sm leading-6 text-black/65"
                  >
                    {currentLyric}
                  </motion.p>
                ) : (
                  <p key="lyrics-waiting" className="text-xs leading-6 text-black/30">
                    播放后逐句显示歌词
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            {displayItems.map((item, index) => item.song?.audioUrl ? (
              <button
                key={`play-${item.id}`}
                ref={(element) => {
                  discButtonRefs.current[index] = element
                }}
                type="button"
                aria-label={`${currentSong?.id === item.song.id && isPlaying ? '暂停' : '播放'} ${item.title}`}
                onClick={() => toggleSong(item, index)}
                className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-black/80 text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-[background-color,box-shadow] hover:bg-[#ff6b35]"
                style={{ willChange: 'transform, opacity' }}
              >
                {currentSong?.id === item.song.id && isPlaying
                  ? <Pause size={15} fill="currentColor" />
                  : <Play size={15} fill="currentColor" className="translate-x-[1px]" />}
              </button>
            ) : null)}
          </div>

          <div className="pointer-events-none absolute bottom-9 left-1/2 z-30 hidden -translate-x-1/2 text-center md:block">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/40">
              {String(activeIndex + 1).padStart(2, '0')} / {String(displayItems.length).padStart(2, '0')}
            </p>
          </div>
        </div>

        {Array.from({ length: displayItems.length * LOOP_CYCLES - 1 }, (_, pageIndex) => (
          <div
            key={`scroll-stop-${pageIndex}`}
            className="pointer-events-none h-screen snap-start snap-always"
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  )
}
