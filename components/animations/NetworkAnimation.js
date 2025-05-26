import { useEffect, useRef } from 'react'

export default function NetworkAnimation({ className = "" }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const nodesRef = useRef([])
  const connectionsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Initialize nodes representing job seekers, authorities, and connections
    const initializeNodes = () => {
      const nodes = []
      const nodeCount = 12 // Subtle number of nodes
      
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.5, // Slow movement
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2, // Small nodes
          type: i < 4 ? 'authority' : i < 8 ? 'jobSeeker' : 'skill',
          opacity: Math.random() * 0.3 + 0.1, // Very subtle
          pulsePhase: Math.random() * Math.PI * 2
        })
      }
      
      nodesRef.current = nodes
      
      // Create connections between nearby nodes
      const connections = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Connect nodes that are reasonably close
          if (distance < 150 && Math.random() > 0.7) {
            connections.push({
              from: i,
              to: j,
              opacity: Math.random() * 0.15 + 0.05, // Very subtle connections
              flowPhase: Math.random() * Math.PI * 2
            })
          }
        }
      }
      
      connectionsRef.current = connections
    }

    // Animation loop
    const animate = (timestamp) => {
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      const nodes = nodesRef.current
      const connections = connectionsRef.current
      
      // Update and draw connections first (behind nodes)
      connections.forEach(connection => {
        const fromNode = nodes[connection.from]
        const toNode = nodes[connection.to]
        
        if (fromNode && toNode) {
          // Subtle flowing effect
          const flowIntensity = Math.sin(timestamp * 0.001 + connection.flowPhase) * 0.5 + 0.5
          const opacity = connection.opacity * flowIntensity
          
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(fromNode.x, fromNode.y)
          ctx.lineTo(toNode.x, toNode.y)
          ctx.stroke()
        }
      })
      
      // Update and draw nodes
      nodes.forEach(node => {
        // Gentle movement
        node.x += node.vx
        node.y += node.vy
        
        // Bounce off edges
        if (node.x < 0 || node.x > rect.width) node.vx *= -1
        if (node.y < 0 || node.y > rect.height) node.vy *= -1
        
        // Keep nodes in bounds
        node.x = Math.max(0, Math.min(rect.width, node.x))
        node.y = Math.max(0, Math.min(rect.height, node.y))
        
        // Subtle pulsing effect
        const pulseIntensity = Math.sin(timestamp * 0.002 + node.pulsePhase) * 0.3 + 0.7
        const currentOpacity = node.opacity * pulseIntensity
        
        // Color based on node type
        let color
        switch (node.type) {
          case 'authority':
            color = `rgba(249, 115, 22, ${currentOpacity})` // Orange for authorities
            break
          case 'jobSeeker':
            color = `rgba(0, 212, 255, ${currentOpacity})` // Cyan for job seekers
            break
          case 'skill':
            color = `rgba(139, 92, 246, ${currentOpacity})` // Purple for skills
            break
          default:
            color = `rgba(107, 114, 128, ${currentOpacity})` // Gray fallback
        }
        
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * pulseIntensity, 0, Math.PI * 2)
        ctx.fill()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize and start animation
    initializeNodes()
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ 
        background: 'transparent',
        pointerEvents: 'none' // Don't interfere with interactions
      }}
    />
  )
}
