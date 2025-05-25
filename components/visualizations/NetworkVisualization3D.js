import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function NetworkVisualization3D({ data, width = 800, height = 600 }) {
  const mountRef = useRef()
  const sceneRef = useRef()
  const rendererRef = useRef()
  const cameraRef = useRef()
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !mountRef.current) return

    setIsLoading(true)

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 100)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Clear previous content and add renderer
    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Materials for different node types
    const materials = {
      company: new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }),
      authority: new THREE.MeshLambertMaterial({ color: 0x00d4ff }),
      jobSeeker: new THREE.MeshLambertMaterial({ color: 0xf97316 }),
      skill: new THREE.MeshLambertMaterial({ color: 0x10b981 }),
      position: new THREE.MeshLambertMaterial({ color: 0xef4444 })
    }

    // Create node geometries
    const geometries = {
      company: new THREE.SphereGeometry(3, 16, 16),
      authority: new THREE.ConeGeometry(2, 4, 8),
      jobSeeker: new THREE.BoxGeometry(2.5, 2.5, 2.5),
      skill: new THREE.OctahedronGeometry(1.5),
      position: new THREE.CylinderGeometry(1.5, 1.5, 3, 8)
    }

    // Position nodes in 3D space using force-directed layout
    const nodePositions = new Map()
    const nodeObjects = new Map()

    // Simple 3D force simulation
    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * Math.PI * 2
      const radius = 30 + Math.random() * 20
      const height = (Math.random() - 0.5) * 40

      const position = {
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius
      }

      nodePositions.set(node.id, position)

      // Create 3D object for node
      const geometry = geometries[node.type] || geometries.skill
      const material = materials[node.type] || materials.skill
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(position.x, position.y, position.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { node, originalColor: material.color.clone() }

      // Add text label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 64
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#000000'
      context.font = '16px Inter, Arial, sans-serif'
      context.textAlign = 'center'
      context.fillText(node.name || node.id, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)
      label.scale.set(8, 2, 1)
      label.position.set(position.x, position.y + 5, position.z)

      scene.add(mesh)
      scene.add(label)
      nodeObjects.set(node.id, { mesh, label })
    })

    // Create links as lines
    const linkObjects = []
    data.links.forEach(link => {
      const sourcePos = nodePositions.get(link.source)
      const targetPos = nodePositions.get(link.target)

      if (sourcePos && targetPos) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
          new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
        ])

        const color = {
          employment: 0x8b5cf6,
          hiring: 0x00d4ff,
          skill: 0xf97316,
          company: 0x8b5cf6,
          preference: 0x10b981,
          match: 0xef4444
        }[link.type] || 0x6b7280

        const material = new THREE.LineBasicMaterial({ 
          color,
          opacity: 0.6,
          transparent: true
        })

        const line = new THREE.Line(geometry, material)
        line.userData = { link }
        scene.add(line)
        linkObjects.push(line)
      }
    })

    // Mouse interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onMouseClick(event) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const meshes = Array.from(nodeObjects.values()).map(obj => obj.mesh)
      const intersects = raycaster.intersectObjects(meshes)

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object
        setSelectedNode(selectedMesh.userData.node)

        // Highlight selected node
        nodeObjects.forEach(({ mesh }) => {
          mesh.material.color.copy(mesh.userData.originalColor)
        })
        selectedMesh.material.color.setHex(0xffff00)

        // Highlight connected links
        linkObjects.forEach(line => {
          const link = line.userData.link
          if (link.source === selectedMesh.userData.node.id || 
              link.target === selectedMesh.userData.node.id) {
            line.material.opacity = 1
            line.material.color.setHex(0xffff00)
          } else {
            line.material.opacity = 0.2
            line.material.color.setHex(0x6b7280)
          }
        })
      }
    }

    renderer.domElement.addEventListener('click', onMouseClick)

    // Camera controls (simple rotation)
    let mouseDown = false
    let mouseX = 0
    let mouseY = 0

    function onMouseDown(event) {
      mouseDown = true
      mouseX = event.clientX
      mouseY = event.clientY
    }

    function onMouseUp() {
      mouseDown = false
    }

    function onMouseMove(event) {
      if (!mouseDown) return

      const deltaX = event.clientX - mouseX
      const deltaY = event.clientY - mouseY

      const spherical = new THREE.Spherical()
      spherical.setFromVector3(camera.position)
      spherical.theta -= deltaX * 0.01
      spherical.phi += deltaY * 0.01
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

      camera.position.setFromSpherical(spherical)
      camera.lookAt(0, 0, 0)

      mouseX = event.clientX
      mouseY = event.clientY
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mousemove', onMouseMove)

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)
      
      // Gentle rotation
      scene.rotation.y += 0.002
      
      renderer.render(scene, camera)
    }

    animate()
    setIsLoading(false)

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('click', onMouseClick)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
    }

  }, [data, width, height])

  return (
    <div className="relative">
      <div ref={mountRef} className="border border-gray-200 rounded-lg bg-white" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">3D Controls</h4>
        <div className="space-y-1 text-xs">
          <p>• Click nodes to select</p>
          <p>• Drag to rotate view</p>
          <p>• Auto-rotation enabled</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">3D Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Companies (Spheres)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
            <span>Authorities (Cones)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500"></div>
            <span>Job Seekers (Cubes)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}></div>
            <span>Skills (Octahedrons)</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm">{selectedNode.name || selectedNode.id}</h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Type:</span> {selectedNode.type}</p>
            {selectedNode.level && <p><span className="font-medium">Level:</span> {selectedNode.level}</p>}
            {selectedNode.hiringPower && <p><span className="font-medium">Hiring Power:</span> {selectedNode.hiringPower}</p>}
            {selectedNode.employeeCount && <p><span className="font-medium">Size:</span> {selectedNode.employeeCount} employees</p>}
            {selectedNode.experience && <p><span className="font-medium">Experience:</span> {selectedNode.experience} years</p>}
          </div>
        </div>
      )}
    </div>
  )
}
