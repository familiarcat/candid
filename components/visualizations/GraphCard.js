import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const CARD_SIZES = {
  mini: { width: 200, height: 64 },
  small: { width: 300, height: 200 },
  medium: { width: 400, height: 300 },
  large: { width: 600, height: 400 }
}

const NODE_COLORS = {
  company: '#3b82f6',
  authority: '#10b981',
  jobSeeker: '#8b5cf6',
  skill: '#ef4444',
  position: '#f59e0b',
  match: '#ec4899'
}

const LINK_COLORS = {
  employment: '#6b7280',
  match: '#ec4899',
  skill: '#ef4444',
  seeks: '#10b981',
  offers: '#f59e0b',
  has: '#8b5cf6'
}

export default function GraphCard({ 
  networkData, 
  title, 
  config, 
  size = 'medium', 
  interactive = true, 
  showStats = false 
}) {
  const svgRef = useRef()
  const [hoveredNode, setHoveredNode] = useState(null)
  const dimensions = CARD_SIZES[size]

  useEffect(() => {
    if (!networkData || !networkData.nodes || networkData.nodes.length === 0) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = size === 'mini' ? 5 : 20

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin}, ${margin})`)

    const innerWidth = width - 2 * margin
    const innerHeight = height - 2 * margin

    // Create force simulation
    const simulation = d3.forceSimulation(networkData.nodes)
      .force('link', d3.forceLink(networkData.links).id(d => d.id).distance(size === 'mini' ? 20 : 50))
      .force('charge', d3.forceManyBody().strength(size === 'mini' ? -30 : -100))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius(d => (d.size || 5) + 2))

    // Create links
    const links = g.selectAll('.link')
      .data(networkData.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => LINK_COLORS[d.type] || '#6b7280')
      .attr('stroke-width', d => size === 'mini' ? 1 : Math.max(1, (d.strength || 0.5) * 3))
      .attr('stroke-opacity', size === 'mini' ? 0.4 : 0.6)

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(networkData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => {
        if (size === 'mini') return d.central ? 3 : 2
        return d.central ? (d.size || 8) * 1.5 : (d.size || 8)
      })
      .attr('fill', d => d.color || NODE_COLORS[d.type] || '#6b7280')
      .attr('stroke', d => d.central ? '#ffffff' : 'none')
      .attr('stroke-width', d => d.central ? 2 : 0)

    // Add node labels (only for non-mini sizes)
    let labels = null
    if (size !== 'mini' && interactive) {
      labels = g.selectAll('.label')
        .data(networkData.nodes)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('text-anchor', 'middle')
        .attr('dy', d => (d.size || 8) + 15)
        .attr('font-size', size === 'small' ? '10px' : '12px')
        .attr('font-weight', d => d.central ? 'bold' : 'normal')
        .attr('fill', '#374151')
        .text(d => {
          const name = d.name || d.title || d.id
          return name.length > 15 ? name.substring(0, 15) + '...' : name
        })
        .style('opacity', 0)
    }

    // Add interactivity for non-mini cards
    if (interactive) {
      nodes
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          setHoveredNode(d)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', (d.central ? (d.size || 8) * 1.5 : (d.size || 8)) * 1.2)
          
          if (labels) {
            labels.filter(node => node.id === d.id)
              .transition()
              .duration(200)
              .style('opacity', 1)
          }

          // Highlight connected links
          links
            .attr('stroke-opacity', link => 
              link.source.id === d.id || link.target.id === d.id ? 0.8 : 0.2
            )
        })
        .on('mouseout', function(event, d) {
          setHoveredNode(null)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d.central ? (d.size || 8) * 1.5 : (d.size || 8))
          
          if (labels) {
            labels
              .transition()
              .duration(200)
              .style('opacity', 0)
          }

          // Reset link opacity
          links
            .transition()
            .duration(200)
            .attr('stroke-opacity', 0.6)
        })

      // Add drag behavior
      nodes.call(d3.drag()
        .on('start', function(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', function(event, d) {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', function(event, d) {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
    }

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      if (labels) {
        labels
          .attr('x', d => d.x)
          .attr('y', d => d.y)
      }
    })

    // Stop simulation after a delay for mini cards
    if (size === 'mini') {
      setTimeout(() => {
        simulation.stop()
      }, 1000)
    }

    return () => {
      simulation.stop()
    }
  }, [networkData, dimensions, size, interactive])

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded border"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <p className="text-xs text-gray-500">No data</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Title (only for non-mini) */}
      {size !== 'mini' && title && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
      )}

      {/* SVG Container */}
      <div className="relative bg-white rounded border">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Hover tooltip */}
        {hoveredNode && interactive && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded pointer-events-none z-10">
            <div className="font-medium">{hoveredNode.name || hoveredNode.title}</div>
            <div className="text-gray-300 capitalize">{hoveredNode.type}</div>
            {hoveredNode.central && (
              <div className="text-blue-300">Central Node</div>
            )}
          </div>
        )}
      </div>

      {/* Stats (only for large cards with showStats) */}
      {showStats && size === 'large' && networkData.stats && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-gray-900">{networkData.stats.totalNodes}</div>
            <div className="text-gray-600">Nodes</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-gray-900">{networkData.stats.totalLinks}</div>
            <div className="text-gray-600">Links</div>
          </div>
          {networkData.stats.matches !== undefined && (
            <div className="text-center">
              <div className="font-bold text-lg text-pink-600">{networkData.stats.matches}</div>
              <div className="text-gray-600">Matches</div>
            </div>
          )}
          {networkData.stats.skills !== undefined && (
            <div className="text-center">
              <div className="font-bold text-lg text-red-600">{networkData.stats.skills}</div>
              <div className="text-gray-600">Skills</div>
            </div>
          )}
        </div>
      )}

      {/* Legend (only for medium and large) */}
      {(size === 'medium' || size === 'large') && interactive && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {Object.entries(NODE_COLORS).map(([type, color]) => {
            const hasType = networkData.nodes.some(node => node.type === type)
            if (!hasType) return null
            
            return (
              <div key={type} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 capitalize">{type}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
