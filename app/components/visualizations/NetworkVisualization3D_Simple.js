import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { NODE_COLORS, LINK_COLORS, getThreeJSGeometry, LEGEND_CONFIG } from '../../../lib/visualizationConstants'

export default function NetworkVisualization3D({
  data,
  width = 800,
  height = 600,
  onNodeClick = () => {},
  rootNodeId = null,
  autoRotate = false,
  enableInteraction = true,
  showMatchReasons = false
}) {
  const mountRef = useRef()
  const sceneRef = useRef()
  const rendererRef = useRef()
  const cameraRef = useRef()
  const controlsRef = useRef()
  const nodeObjectsRef = useRef(new Map())
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

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
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      rendererRef.current = renderer

      if (!mountRef.current) {
        console.error('❌ Mount ref became unavailable during setup')
        renderer.dispose()
        setIsLoading(false)
        return
      }

      mountRef.current.innerHTML = ''
      mountRef.current.appendChild(renderer.domElement)

      // Enhanced OrbitControls setup for mouse interaction
      const controls = new OrbitControls(camera, renderer.domElement)
      controlsRef.current = controls

      // Configure controls for intuitive interaction
      controls.enableDamping = true // Smooth camera movements
      controls.dampingFactor = 0.05
      controls.screenSpacePanning = false

      // Zoom settings
      controls.minDistance = 20 // Minimum zoom distance
      controls.maxDistance = 500 // Maximum zoom distance
      controls.enableZoom = true

      // Rotation settings
      controls.enableRotate = true
      controls.rotateSpeed = 0.5
      controls.autoRotate = autoRotateEnabled
      controls.autoRotateSpeed = 1.0

      // Pan settings
      controls.enablePan = true
      controls.panSpeed = 0.8
      controls.keyPanSpeed = 7.0

      // Vertical rotation limits
      controls.maxPolarAngle = Math.PI // Allow full vertical rotation
      controls.minPolarAngle = 0

      // Mouse button assignments
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }

      // Touch controls for mobile (future enhancement)
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }

      console.log('✅ OrbitControls initialized with enhanced mouse interaction')

      // Mouse interaction for node selection
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      function onMouseClick(event) {
        if (!enableInteraction) return

        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // Update raycaster
        raycaster.setFromCamera(mouse, camera)

        // Find intersected objects (nodes)
        const nodeObjects = Array.from(nodeObjectsRef.current.values()).map(obj => obj.mesh)
        const intersects = raycaster.intersectObjects(nodeObjects)

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object
          const nodeData = clickedObject.userData.node

          // Handle node selection
          handleNodeSelection(nodeData, clickedObject)

          // Call external click handler
          onNodeClick(nodeData)

          console.log('🎯 Node clicked:', nodeData.name || nodeData.id)
        }
      }

      function handleNodeSelection(nodeData, meshObject) {
        // Reset previous selection
        if (selectedNode) {
          const prevObject = nodeObjectsRef.current.get(selectedNode.id)
          if (prevObject && prevObject.mesh) {
            prevObject.mesh.material.emissive.setHex(0x000000)
            prevObject.mesh.scale.set(1, 1, 1)
          }
        }

        // Highlight new selection
        setSelectedNode(nodeData)
        meshObject.material.emissive.setHex(0x444444) // Highlight color
        meshObject.scale.set(1.2, 1.2, 1.2) // Slightly larger

        // Optional: Focus camera on selected node
        if (controlsRef.current) {
          const targetPosition = meshObject.position.clone()
          controlsRef.current.target.copy(targetPosition)
          controlsRef.current.update()
        }
      }

      // Add mouse event listener
      renderer.domElement.addEventListener('click', onMouseClick, false)

      // Mouse hover effects
      function onMouseMove(event) {
        if (!enableInteraction) return

        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const nodeObjects = Array.from(nodeObjectsRef.current.values()).map(obj => obj.mesh)
        const intersects = raycaster.intersectObjects(nodeObjects)

        // Change cursor on hover
        renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default'
      }

      renderer.domElement.addEventListener('mousemove', onMouseMove, false)

      // Enhanced lighting setup for better color visibility
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5) // Increased ambient light
      scene.add(ambientLight)

      // Primary directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8) // Increased intensity
      directionalLight.position.set(50, 50, 50)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      // Secondary directional light from opposite side
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight2.position.set(-50, -50, -50)
      scene.add(directionalLight2)

      // Point lights for enhanced shape definition
      const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 200)
      pointLight1.position.set(30, 30, 30)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 200)
      pointLight2.position.set(-30, 30, -30)
      scene.add(pointLight2)

      // Hemisphere light for natural lighting
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
      scene.add(hemisphereLight)

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

        // Create node geometry based on type with root node emphasis
        const isRoot = node.id === rootNodeId
        const nodeColor = node.color ?
          (typeof node.color === 'string' ? parseInt(node.color.replace('#', '0x')) : node.color) :
          (NODE_COLORS[node.type]?.hex || NODE_COLORS.skill?.hex || 0x6366f1)

        const nodeSize = node.size ? node.size / 4 : (isRoot ? 4 : 2.5) // Scale down for 3D
        const geometry = new THREE.SphereGeometry(nodeSize, 12, 12)

        const material = new THREE.MeshLambertMaterial({
          color: nodeColor,
          opacity: node.opacity || 1,
          transparent: node.opacity !== undefined && node.opacity < 1,
          emissive: isRoot ? 0x333300 : 0x000000 // Slight glow for root node
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

        // Store in ref for interaction
        nodeObjectsRef.current.set(node.id, { mesh, label, position })

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

      // Enhanced animation loop with controls and interaction
      function animate() {
        animationId = requestAnimationFrame(animate)

        // Update controls for smooth damping
        if (controlsRef.current) {
          controlsRef.current.update()
        }

        // Auto-rotate is now handled by OrbitControls
        // No need for manual scene rotation

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

    // Enhanced cleanup function
    return () => {
      console.log('🧹 Cleaning up 3D visualization...')

      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      // Cleanup controls
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }

      // Remove event listeners
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('click', onMouseClick)
        renderer.domElement.removeEventListener('mousemove', onMouseMove)
      }

      // Clear node references
      nodeObjectsRef.current.clear()

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

  }, [data, width, height, autoRotateEnabled])

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

      {/* Enhanced Controls Panel */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
        <h4 className="font-semibold text-sm mb-3 text-gray-800">3D Controls</h4>

        {/* Auto-rotate toggle */}
        <div className="mb-3">
          <button
            onClick={() => {
              const newAutoRotate = !autoRotateEnabled
              setAutoRotateEnabled(newAutoRotate)
              if (controlsRef.current) {
                controlsRef.current.autoRotate = newAutoRotate
              }
            }}
            className={`text-xs px-3 py-1.5 rounded transition-colors font-medium ${
              autoRotateEnabled
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoRotateEnabled ? '⏸️ Stop Rotation' : '▶️ Auto Rotate'}
          </button>
        </div>

        {/* Mouse controls guide */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-700 mb-1">Mouse Controls:</div>
          <div>🖱️ <strong>Left Click + Drag:</strong> Rotate</div>
          <div>🖱️ <strong>Right Click + Drag:</strong> Pan</div>
          <div>🖱️ <strong>Scroll Wheel:</strong> Zoom</div>
          <div>🖱️ <strong>Click Node:</strong> Select & Focus</div>
        </div>

        {/* Selected node info */}
        {selectedNode && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-1">Selected:</div>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <div className="font-medium">{selectedNode.name || selectedNode.id}</div>
              <div className="text-gray-500">Type: {selectedNode.type}</div>
            </div>
          </div>
        )}
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
