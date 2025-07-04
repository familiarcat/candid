import { useEffect, useRef } from 'react'

export default function GraphVisualization3D({ data }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!data || !containerRef.current || typeof window === 'undefined') return

    // Clear previous visualization
    containerRef.current.innerHTML = ''

    // Dynamically import and initialize 3D force graph
    import('3d-force-graph').then((ForceGraph3DModule) => {
      const ForceGraph3DComponent = ForceGraph3DModule.default

      const graph = ForceGraph3DComponent()
        .width(containerRef.current.clientWidth)
        .height(500)
        .backgroundColor('#ffffff')
        .nodeColor(node => {
          switch(node.type) {
            case 'company': return '#8b5cf6' // purple - FIXED
            case 'authority': return '#00d4ff' // cyan
            case 'jobSeeker': return '#f97316' // orange
            case 'skill': return '#10b981' // green
            case 'position': return '#ef4444' // red
            default: return '#6366f1' // indigo
          }
        })
        .nodeLabel(node => node.name)
        .nodeVal(node => node.size || 5)
        .linkWidth(link => link.value || 1)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleSpeed(0.005)
        .graphData(data)
        (containerRef.current)

      // Handle window resize
      const handleResize = () => {
        if (containerRef.current) {
          graph.width(containerRef.current.clientWidth)
        }
      }

      window.addEventListener('resize', handleResize)
    }).catch(error => {
      console.error('Failed to load 3D visualization:', error)
      // Fallback to a simple message
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">3D visualization unavailable</div>'
      }
    })
  }, [data])

  return (
    <div ref={containerRef} className="w-full h-[500px] border rounded-lg shadow-sm bg-white"></div>
  )
}