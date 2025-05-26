import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { NODE_COLORS, LINK_COLORS, getThreeJSGeometry, LEGEND_CONFIG } from '../../lib/visualizationConstants'

export default function NetworkVisualization3D({ data, width = 800, height = 600 }) {
  const mountRef = useRef()
  const sceneRef = useRef()
  const rendererRef = useRef()
  const cameraRef = useRef()
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !mountRef.current) {
      console.log('⚠️ 3D Visualization: Missing data or mount ref', {
        hasData: !!data,
        hasNodes: !!(data?.nodes),
        hasLinks: !!(data?.links),
        nodeCount: data?.nodes?.length || 0,
        linkCount: data?.links?.length || 0,
        hasMountRef: !!mountRef.current
      })
      return
    }

    console.log('🎨 Initializing 3D visualization...', {
      nodes: data.nodes.length,
      links: data.links.length,
      nodeTypes: [...new Set(data.nodes.map(n => n.type))],
      linkTypes: [...new Set(data.links.map(l => l.type))]
    })

    setIsLoading(true)
    setError(null)

    // Cleanup previous scene
    if (rendererRef.current) {
      console.log('🧹 Cleaning up previous 3D scene...')

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
        sceneRef.current.clear()
      }

      rendererRef.current.dispose()
      if (mountRef.current) {
        mountRef.current.innerHTML = ''
      }
    }

    let animationId = null
    let scene, camera, renderer

    try {
      // Scene setup
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf8fafc)
      sceneRef.current = scene

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.set(0, 0, 100)
      cameraRef.current = camera

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      rendererRef.current = renderer

      if (!mountRef.current) {
        console.error('❌ Mount ref became unavailable during setup')
        renderer.dispose()
        setIsLoading(false)
        return
      }

      mountRef.current.innerHTML = ''
      mountRef.current.appendChild(renderer.domElement)

      // Basic lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(50, 50, 50)
      scene.add(directionalLight)

      // Create nodes with labels
      const nodeObjects = new Map()
      console.log('🎯 Creating nodes with labels...', { count: data.nodes.length })

      data.nodes.forEach((node, index) => {
        const angle = (index / data.nodes.length) * Math.PI * 2
        const radius = 30 + Math.random() * 20
        const height = (Math.random() - 0.5) * 40

        const position = {
          x: Math.cos(angle) * radius,
          y: height,
          z: Math.sin(angle) * radius
        }

        // Create node geometry based on type
        const nodeColor = NODE_COLORS[node.type]?.hex || NODE_COLORS.skill?.hex || '#6366f1'
        const geometry = new THREE.SphereGeometry(2.5, 12, 12) // Slightly larger and smoother
        const material = new THREE.MeshLambertMaterial({
          color: nodeColor
        })
        const mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(position.x, position.y, position.z)
        mesh.userData = { node, originalColor: nodeColor }

        // Create text label
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 256
        canvas.height = 64

        // Clear canvas
        context.fillStyle = 'rgba(255, 255, 255, 0.9)'
        context.fillRect(0, 0, canvas.width, canvas.height)

        // Add border
        context.strokeStyle = '#333333'
        context.lineWidth = 2
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

        // Add text
        context.fillStyle = '#000000'
        context.font = 'bold 16px Arial, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        const text = node.name || node.id || 'Unknown'
        context.fillText(text, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        })
        const label = new THREE.Sprite(labelMaterial)
        label.scale.set(12, 3, 1) // Larger labels for better visibility
        label.position.set(position.x, position.y + 6, position.z) // Position above node

        scene.add(mesh)
        scene.add(label)
        nodeObjects.set(node.id, { mesh, label, position })

        console.log(`✅ Created node: ${node.name || node.id} (${node.type})`)
      })

      // Create links with enhanced debugging
      console.log('🔗 Creating links...', { count: data.links.length })
      let linksCreated = 0

      data.links.forEach((link, index) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        const targetId = typeof link.target === 'string' ? link.target : link.target.id

        const sourceObj = nodeObjects.get(sourceId)
        const targetObj = nodeObjects.get(targetId)

        if (sourceObj && targetObj) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sourceObj.position.x, sourceObj.position.y, sourceObj.position.z),
            new THREE.Vector3(targetObj.position.x, targetObj.position.y, targetObj.position.z)
          ])

          const linkColor = LINK_COLORS[link.type]?.hex || LINK_COLORS.default?.hex || '#6b7280'
          const material = new THREE.LineBasicMaterial({
            color: linkColor,
            opacity: 0.8,
            transparent: true,
            linewidth: 2
          })

          const line = new THREE.Line(geometry, material)
          scene.add(line)
          linksCreated++

          console.log(`✅ Created link: ${sourceId} → ${targetId} (${link.type})`)
        } else {
          console.warn(`⚠️ Missing nodes for link ${index}:`, {
            sourceId,
            targetId,
            hasSource: !!sourceObj,
            hasTarget: !!targetObj,
            availableNodes: Array.from(nodeObjects.keys())
          })
        }
      })

      console.log(`✅ Links created: ${linksCreated}/${data.links.length}`)

      // Simple animation loop
      function animate() {
        animationId = requestAnimationFrame(animate)

        if (autoRotate) {
          scene.rotation.y += 0.002
        }

        renderer.render(scene, camera)
      }

      animationId = requestAnimationFrame(animate)
      setIsLoading(false)

      console.log('✅ 3D scene initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize 3D visualization:', error)
      setError(error.message)
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up 3D visualization...')

      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }

      if (renderer) {
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    }

  }, [data, width, height, autoRotate])

  if (error) {
    return (
      <div className="relative">
        <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-600 text-lg mb-2">⚠️ 3D Visualization Error</div>
            <div className="text-red-500 text-sm mb-3">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ width: width, height: height }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">3D Controls</h4>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`text-xs px-2 py-1 rounded ${
            autoRotate
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {autoRotate ? '⏸️ Stop Rotation' : '▶️ Auto Rotate'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">3D Legend</h4>
        <div className="space-y-2 text-xs">
          {LEGEND_CONFIG.map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
