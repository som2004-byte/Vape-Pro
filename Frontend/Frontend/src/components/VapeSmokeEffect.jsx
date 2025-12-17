import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

const VapeSmokeEffect = ({ 
  density = 50, 
  speed = 0.5, 
  opacity = 0.6,
  position = [0, 0, 0]
}) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const smokeParticlesRef = useRef([])
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      1,
      1000
    )
    camera.position.z = 1000

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    mountRef.current.appendChild(renderer.domElement)

    // Create smoke texture
    const smokeTexture = createSmokeTexture()
    
    // Create smoke particles with varying sizes for depth
    const smokeParticles = []
    const baseSizes = [200, 250, 300, 350]
    
    for (let i = 0; i < density; i++) {
      const size = baseSizes[Math.floor(Math.random() * baseSizes.length)]
      const smokeGeometry = new THREE.PlaneGeometry(size, size)
      
      const smokeMaterial = new THREE.MeshLambertMaterial({
        map: smokeTexture,
        transparent: true,
        opacity: opacity * (0.7 + Math.random() * 0.3),
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
      
      const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial)
      
      // Start from bottom center area
      smokeMesh.position.set(
        (Math.random() - 0.5) * 600,
        -300 + Math.random() * 200,
        Math.random() * 400 - 200
      )
      smokeMesh.rotation.z = Math.random() * Math.PI * 2
      smokeMesh.rotation.x = Math.random() * 0.5
      smokeMesh.rotation.y = Math.random() * 0.5
      
      // Store initial properties for animation
      smokeMesh.userData = {
        baseX: smokeMesh.position.x,
        baseY: smokeMesh.position.y,
        baseZ: smokeMesh.position.z,
        speed: 0.3 + Math.random() * 0.4,
        curlSpeed: 0.002 + Math.random() * 0.003,
        driftX: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        scaleSpeed: 0.001 + Math.random() * 0.002
      }
      
      scene.add(smokeMesh)
      smokeParticles.push(smokeMesh)
    }

    smokeParticlesRef.current = smokeParticles

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.5)
    light.position.set(-1, 0, 1)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // Animation - Premium curling and dispersing motion
    let frame = 0
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      frame += speed * 0.016 // Normalize to 60fps

      smokeParticles.forEach((particle, i) => {
        const data = particle.userData
        const time = frame * data.speed
        
        // Vertical rise with acceleration
        particle.position.y += (1 + time * 0.001) * speed * 0.8
        
        // Curling motion - spiral effect
        const curlPhase = time * data.curlSpeed + data.phase
        particle.position.x = data.baseX + Math.cos(curlPhase) * (100 + time * 0.5)
        particle.position.z = data.baseZ + Math.sin(curlPhase * 1.3) * (80 + time * 0.4)
        
        // Gentle horizontal drift
        particle.position.x += data.driftX * speed
        
        // Rotation for 3D curling effect
        particle.rotation.z += data.curlSpeed * 0.5 * speed
        particle.rotation.y += Math.sin(curlPhase) * 0.002 * speed
        particle.rotation.x += Math.cos(curlPhase * 0.7) * 0.001 * speed

        // Scale expansion as it rises (disperses)
        const baseScale = 0.8 + Math.random() * 0.4
        const expansion = 1 + time * data.scaleSpeed * 0.5
        const pulse = 1 + Math.sin(time * 0.5 + data.phase) * 0.1
        particle.scale.set(
          baseScale * expansion * pulse,
          baseScale * expansion * pulse,
          1
        )

        // Opacity fade - fade in at start, fade out as it rises
        const fadeIn = Math.min(1, time * 0.01)
        const fadeOut = Math.max(0, 1 - (particle.position.y / 400))
        const opacityVariation = Math.sin(time * 0.3 + data.phase) * 0.15 + 0.85
        particle.material.opacity = opacity * fadeIn * fadeOut * opacityVariation

        // Reset position when it moves too far up or away
        if (particle.position.y > 500 || 
            Math.abs(particle.position.x) > 600 || 
            particle.position.z > 500) {
          particle.position.set(
            (Math.random() - 0.5) * 600,
            -300 + Math.random() * 200,
            Math.random() * 400 - 200
          )
          particle.userData.baseX = particle.position.x
          particle.userData.baseY = particle.position.y
          particle.userData.baseZ = particle.position.z
          particle.userData.phase = Math.random() * Math.PI * 2
          particle.material.opacity = 0
        }
      })

      renderer.render(scene, camera)
    }

    animate()
    sceneRef.current = scene

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      smokeTexture.dispose()
      smokeParticles.forEach(particle => {
        particle.material.dispose()
        particle.geometry.dispose()
      })
    }
  }, [density, speed, opacity])

  return (
    <div 
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// Create premium vape smoke texture - white/grey, ethereal
const createSmokeTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Create multiple layered gradients for depth
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  
  // Core bright center
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, canvas.width * 0.15
  )
  coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = coreGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Medium layer
  const midGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, canvas.width * 0.35
  )
  midGradient.addColorStop(0, 'rgba(240, 240, 240, 0.12)')
  midGradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.06)')
  midGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = midGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Outer layer - more diffuse
  const outerGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, canvas.width / 2
  )
  outerGradient.addColorStop(0, 'rgba(200, 200, 200, 0.08)')
  outerGradient.addColorStop(0.4, 'rgba(180, 180, 180, 0.04)')
  outerGradient.addColorStop(0.7, 'rgba(160, 160, 160, 0.02)')
  outerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = outerGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add procedural noise for organic texture
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % canvas.width
    const y = Math.floor((i / 4) / canvas.width)
    const distFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    )
    const maxDist = canvas.width / 2
    
    // Add organic noise that fades toward edges
    const noiseStrength = (1 - distFromCenter / maxDist) * 0.15
    const noise = (Math.random() - 0.5) * noiseStrength
    
    data[i] = Math.min(255, Math.max(0, data[i] + noise * 255))     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 255)) // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 255)) // B
    data[i + 3] = data[i + 3] * (0.85 + Math.random() * 0.15) // A - slight variation
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default VapeSmokeEffect

