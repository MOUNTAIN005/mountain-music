'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export default function ThreeSceneEnhanced() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight

    // ---- Scene Setup ----
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x080808, 0.025)

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(0, 1.5, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // ---- Post-processing ----
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.3, 0.15)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    // ---- Particle Wave Grid ----
    const gridSize = 40
    const spacing = 0.3
    const waveCount = gridSize * gridSize
    const wavePos = new Float32Array(waveCount * 3)
    const waveCols = new Float32Array(waveCount * 3)
    const ci = new THREE.Color(0x8b5cf6)
    const cb = new THREE.Color(0x3b82f6)
    const cc = new THREE.Color(0x06b6d4)

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j
        wavePos[idx * 3] = (i - gridSize / 2) * spacing
        wavePos[idx * 3 + 1] = 0
        wavePos[idx * 3 + 2] = (j - gridSize / 2) * spacing
        const t = (i / gridSize + j / gridSize) / 2
        const color = ci.clone().lerp(cb, t).lerp(cc, t * 0.6)
        waveCols[idx * 3] = color.r
        waveCols[idx * 3 + 1] = color.g
        waveCols[idx * 3 + 2] = color.b
      }
    }

    const waveGeom = new THREE.BufferGeometry()
    waveGeom.setAttribute('position', new THREE.BufferAttribute(wavePos, 3))
    waveGeom.setAttribute('color', new THREE.BufferAttribute(waveCols, 3))

    const waveMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const wavePoints = new THREE.Points(waveGeom, waveMat)
    wavePoints.position.y = -1.0
    scene.add(wavePoints)

    // Glow layer
    const waveGeom2 = new THREE.BufferGeometry()
    waveGeom2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wavePos), 3))
    waveGeom2.setAttribute('color', new THREE.BufferAttribute(waveCols, 3))
    const waveMat2 = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const wavePoints2 = new THREE.Points(waveGeom2, waveMat2)
    wavePoints2.position.y = -1.0
    scene.add(wavePoints2)

    // ---- Orbiting Rings ----
    const ringGroup = new THREE.Group()
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(2.8 + i * 0.4, 0.015, 16, 64),
        new THREE.MeshBasicMaterial({
          color: i === 0 ? 0x8b5cf6 : i === 1 ? 0x3b82f6 : 0x06b6d4,
          transparent: true,
          opacity: 0.12,
        })
      )
      r.rotation.x = Math.PI / 4 + i * 0.3
      r.rotation.y = i * 0.5
      ringGroup.add(r)
    }
    scene.add(ringGroup)

    // ---- Background Floating Particles ----
    const pCount = 600
    const pPos = new Float32Array(pCount * 3)
    const pCols = new Float32Array(pCount * 3)
    const pSizes = new Float32Array(pCount)
    const ca = new THREE.Color(0x8b5cf6)
    const c2 = new THREE.Color(0x3b82f6)

    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 8
      pPos[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      pPos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.5
      pPos[i * 3 + 2] = Math.cos(phi) * r
      const c = ca.clone().lerp(c2, Math.random())
      pCols[i * 3] = c.r
      pCols[i * 3 + 1] = c.g
      pCols[i * 3 + 2] = c.b
      pSizes[i] = Math.random() * 0.1 + 0.02
    }

    const pGeom = new THREE.BufferGeometry()
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeom.setAttribute('color', new THREE.BufferAttribute(pCols, 3))

    const pMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const particles = new THREE.Points(pGeom, pMat)
    scene.add(particles)

    const initPpos = new Float32Array(pPos)

    // ---- Mouse ----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const handleMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)

    // ---- Animation ----
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.006

      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04

      // Animate wave grid
      const wp = wavePoints.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const idx = i * gridSize + j
          const x = (i - gridSize / 2) * spacing
          const z = (j - gridSize / 2) * spacing
          const dist = Math.sqrt(x * x + z * z)
          const wave = Math.sin(dist * 0.5 - time * 1.2) * 0.4
            + Math.sin(x * 0.4 + time * 0.8) * 0.2
            + Math.cos(z * 0.4 + time * 0.7) * 0.2
          const mDist = Math.sqrt((x - mouse.x * 4) ** 2 + (z - mouse.y * 3) ** 2)
          const mWave = Math.max(0, 1 - mDist / 5) * 0.6
          wp[idx * 3 + 1] = wave + mWave * 0.3
        }
      }
      wavePoints.geometry.attributes.position.needsUpdate = true

      // Sync glow layer (80% of main wave)
      const wp2 = wavePoints2.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < waveCount; i++) {
        wp2[i * 3 + 1] = wp[i * 3 + 1] * 0.8
      }
      wavePoints2.geometry.attributes.position.needsUpdate = true

      // Rotate rings
      ringGroup.rotation.y += 0.002
      ringGroup.rotation.x += 0.001

      // Camera follows mouse
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.015
      camera.position.y += (-mouse.y * 1.0 + 1.5 - camera.position.y) * 0.015
      camera.lookAt(0, 0.5, 0)

      // Floating particles
      const pp = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < pCount; i++) {
        const i3 = i * 3
        pp[i3] = initPpos[i3] + Math.sin(time * 0.2 + i * 0.01) * 0.3
        pp[i3 + 1] = initPpos[i3 + 1] + Math.cos(time * 0.15 + i * 0.012) * 0.3
        pp[i3 + 2] = initPpos[i3 + 2] + Math.sin(time * 0.12 + i * 0.008) * 0.3
      }
      particles.geometry.attributes.position.needsUpdate = true

      composer.render()
    }
    animate()

    // ---- Resize ----
    const handleResize = () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer.setSize(cw, ch)
      composer.setSize(cw, ch)
    }
    window.addEventListener('resize', handleResize)

    // ---- Cleanup ----
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      composer.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Line) {
          o.geometry?.dispose()
          const mat = Array.isArray(o.material) ? o.material : [o.material]
          mat.forEach((m) => m.dispose())
        }
      })
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
