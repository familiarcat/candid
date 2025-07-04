import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function GraphVisualization2D({ data }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data || !svgRef.current || typeof window === 'undefined') return

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 800
    const height = 600

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Create links with enhanced visibility
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => {
        // Use consistent colors from visualization constants
        switch(d.type) {
          case 'hiring': return '#00d4ff' // Cyan for hiring connections
          case 'company': return '#8b5cf6' // Purple for company connections
          case 'skill': return '#f97316' // Orange for skill connections
          default: return '#6b7280' // Gray for other connections
        }
      })
      .attr('stroke-opacity', 0.8) // Increased opacity
      .attr('stroke-width', d => Math.max(2, Math.sqrt(d.value || d.strength || 1) * 2)) // Thicker lines

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => d.size || 5)
      .attr('fill', d => {
        switch(d.type) {
          case 'company': return '#8b5cf6' // purple - FIXED
          case 'authority': return '#00d4ff' // cyan
          case 'jobSeeker': return '#f97316' // orange
          case 'skill': return '#10b981' // green
          case 'position': return '#ef4444' // red
          default: return '#6366f1' // indigo
        }
      })
      .call(drag(simulation))

    // Add titles for nodes
    node.append('title')
      .text(d => d.name)

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    return () => {
      simulation.stop()
    }
  }, [data])

  return (
    <div className="border rounded-lg shadow-sm bg-white p-4">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  )
}