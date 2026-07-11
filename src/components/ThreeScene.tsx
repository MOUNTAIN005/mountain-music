'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // === Mouse tracking ===
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
    const handleMouse = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)

    // === Central Icosahedron (glowing wireframe) ===
    const geometry = new THREE.IcosahedronGeometry(2.2, 0)
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.5,
    })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    scene.add(wireframe)

    // Inner glow sphere
    const glowGeo = new THREE.IcosahedronGeometry(1.8, 1)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6d28d9,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    })
    const glowMesh = new THREE.Mesh(glowGeo, glowMat)
    scene.add(glowMesh)

    // Outer rings
    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(2.8 + i * 0.6, 0.02, 16, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x8b5cf6 : i === 1 ? 0x3b82f6 : 0x06b6d4,
        transparent: true,
        opacity: 0.2 - i * 0.05,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 3 + i * 0.3
      ring.rotation.y = i * 0.5
      scene.add(ring)
      rings.push(ring)
    }

    // === Particle field ===
    const particleCount = 800
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const colorA = new THREE.Color(0x8b5cf6)
    const colorB = new THREE.Color(0x3b82f6)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      const mix = Math.random()
      const c = colorA.clone().lerp(colorB, mix)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = Math.random() * 0.15 + 0.05
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Store initial particle positions
    const initialPositions = new Float32Array(positions)

    // === Animation loop ===
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.005

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Rotate central objects
      wireframe.rotation.x += 0.003
      wireframe.rotation.y += 0.005
      glowMesh.rotation.x = wireframe.rotation.x
      glowMesh.rotation.y = wireframe.rotation.y

      // Animate rings
      rings.forEach((ring, i) => {
        ring.rotation.x += 0.002 * (i + 1)
        ring.rotation.z += 0.003 * (i + 1)
        ring.rotation.y = time * 0.2 * (i + 1)
      })

      // Camera follows mouse
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      // Particle animation
      const pos = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        // Gentle floating motion
        pos[i3] = initialPositions[i3] + Math.sin(time * 0.3 + i * 0.01) * 0.5
        pos[i3 + 1] = initialPositions[i3 + 1] + Math.cos(time * 0.2 + i * 0.015) * 0.5
        pos[i3 + 2] = initialPositions[i3 + 2] + Math.sin(time * 0.15 + i * 0.02) * 0.3

        // Mouse influence
        const dx = pos[i3] - mouse.x * 5
        const dy = pos[i3 + 1] - mouse.y * 4
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 4) {
          const force = (4 - dist) / 4
          pos[i3] += dx * force * 0.01
          pos[i3 + 1] += dy * force * 0.01
        }
      }
      particles.geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // === Resize ===
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // === Cleanup ===
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      edges.dispose()
      glowGeo.dispose()
      particleGeo.dispose()
      rings.forEach((r) => { r.geometry.dispose(); (r.material as THREE.Material).dispose() })
      container.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
