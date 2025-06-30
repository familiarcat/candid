import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { NODE_COLORS, LINK_COLORS, getThreeJSGeometry } from '../../lib/visualizationConstants'

export default function NetworkVisualization3DBackground({
  data,
  width = 800,
  height = 400,
  opacity = 0.3,
  autoRotate = true,
  rotationSpeed = 0.001,
  cameraDistance = 120,
  lightIntensity = 0.8,
  className = ""
}) {
  const mountRef = useRef()
  const sceneRef = useRef()
  const rendererRef = useRef()
  const cameraRef = useRef()
  const animationRef = useRef()

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !mountRef.current) return

    // Scene setup with transparent background
    const scene = new THREE.Scene()
    scene.background = null // Transparent background
    sceneRef.current = scene

    // Camera setup - positioned to view network from bottom origin
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 80, cameraDistance)
    camera.lookAt(0, 40, 0) // Look at middle height of the network
    cameraRef.current = camera

    // Renderer setup with transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Enable transparency
      premultipliedAlpha: false
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // Transparent clear color
    renderer.shadowMap.enabled = false // Disable shadows for performance
    rendererRef.current = renderer

    // Clear previous content and add renderer
    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // Enhanced dramatic lighting for shape emphasis
    const ambientLight = new THREE.AmbientLight(0x404040, lightIntensity * 1.8)
    scene.add(ambientLight)

    // Primary directional light from top-front for shape definition
    const primaryLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.8)
    primaryLight.position.set(50, 120, 80)
    primaryLight.castShadow = false // Disable shadows for performance
    scene.add(primaryLight)

    // Key point light from out-of-frame to emphasize shapes and structure
    const keyPointLight = new THREE.PointLight(0xffffff, lightIntensity * 1.2, 200)
    keyPointLight.position.set(-100, 150, 120) // Out of frame, elevated
    scene.add(keyPointLight)

    // Fill light from opposite side for balanced illumination
    const fillLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.5)
    fillLight.position.set(-50, 80, -80)
    scene.add(fillLight)

    // Rim light from behind to create depth and separation
    const rimLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 0.4)
    rimLight.position.set(0, 60, -120)
    scene.add(rimLight)

    // Enhanced materials for better shape definition and color visibility
    const materials = {}
    Object.keys(NODE_COLORS).forEach(nodeType => {
      materials[nodeType] = new THREE.MeshPhongMaterial({
        color: NODE_COLORS[nodeType].hex,
        transparent: true,
        opacity: opacity * (nodeType === 'authority' ? 1.0 : nodeType === 'company' || nodeType === 'position' ? 0.9 : 0.8),
        shininess: 30, // Add subtle shine for shape definition
        specular: 0x222222 // Subtle specular highlights
      })
    })

    // Smaller geometries for background effect (using consistent shapes)
    const geometries = {}
    Object.keys(NODE_COLORS).forEach(nodeType => {
      const geomConfig = getThreeJSGeometry(nodeType, true) // true for background version
      switch (geomConfig.type) {
        case 'SphereGeometry':
          geometries[nodeType] = new THREE.SphereGeometry(...geomConfig.params)
          break
        case 'ConeGeometry':
          geometries[nodeType] = new THREE.ConeGeometry(...geomConfig.params)
          break
        case 'BoxGeometry':
          geometries[nodeType] = new THREE.BoxGeometry(...geomConfig.params)
          break
        case 'OctahedronGeometry':
          geometries[nodeType] = new THREE.OctahedronGeometry(...geomConfig.params)
          break
        case 'CylinderGeometry':
          geometries[nodeType] = new THREE.CylinderGeometry(...geomConfig.params)
          break
        default:
          geometries[nodeType] = new THREE.OctahedronGeometry(1.2) // fallback
      }
    })

    // Position nodes in 3D space originating from bottom with vertical emphasis
    const nodePositions = new Map()
    const nodeObjects = []

    // Calculate bounds for vertical network structure
    const maxRadius = Math.min(width, height) * 0.12
    const layers = Math.ceil(Math.sqrt(data.nodes.length))
    const maxHeight = 80 // Maximum height for the network

    data.nodes.forEach((node, index) => {
      // Distribute nodes in multiple layers with bottom origin
      const layer = Math.floor(index / layers)
      const indexInLayer = index % layers
      const angleStep = (Math.PI * 2) / Math.max(1, layers)
      const angle = indexInLayer * angleStep + (layer * 0.3)

      // Create expanding radius as height increases (tree-like structure)
      const heightProgress = layer / Math.max(1, layers - 1)
      const radius = maxRadius * (0.2 + (heightProgress * 0.8))

      // Position from bottom (y=0) upward with some randomization
      const baseHeight = (heightProgress * maxHeight) + (Math.random() * 8 - 4)
      const height = Math.max(0, baseHeight) // Ensure no nodes below origin

      const position = {
        x: Math.cos(angle) * radius,
        y: height, // Start from bottom (0) and grow upward
        z: Math.sin(angle) * radius
      }

      nodePositions.set(node.id, position)

      // Create 3D object for node
      const geometry = geometries[node.type] || geometries.skill
      const material = materials[node.type] || materials.skill
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.set(position.x, position.y, position.z)
      mesh.userData = { node }

      scene.add(mesh)
      nodeObjects.push(mesh)
    })

    // Create links with reduced opacity
    const linkObjects = []
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      const sourcePos = nodePositions.get(sourceId)
      const targetPos = nodePositions.get(targetId)

      if (sourcePos && targetPos) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
          new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
        ])

        const color = LINK_COLORS[link.type]?.hex || LINK_COLORS.default.hex

        const material = new THREE.LineBasicMaterial({
          color,
          opacity: opacity * 0.6, // Enhanced link visibility
          transparent: true,
          linewidth: 1.5 // Slightly thicker lines for better visibility
        })

        const line = new THREE.Line(geometry, material)
        scene.add(line)
        linkObjects.push(line)
      }
    })

    // Animation loop with slow rotation
    function animate() {
      if (autoRotate) {
        scene.rotation.y += rotationSpeed
        // Add subtle vertical oscillation
        scene.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1
      }

      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      // Dispose of geometries and materials
      nodeObjects.forEach(mesh => {
        mesh.geometry.dispose()
        mesh.material.dispose()
      })

      linkObjects.forEach(line => {
        line.geometry.dispose()
        line.material.dispose()
      })

      renderer.dispose()
    }

  }, [data, width, height, opacity, autoRotate, rotationSpeed, cameraDistance, lightIntensity])

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        background: 'transparent',
        zIndex: 1 // Behind other content
      }}
    />
  )
}
