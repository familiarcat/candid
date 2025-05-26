import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getNodeColor, getLinkColor } from '../../lib/visualizationConstants'

export default function AuthorityNetworkGraph({ data, width = 800, height = 600 }) {
  const svgRef = useRef()
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    if (!data || !data.nodes || !data.links) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    // Set up the simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // Create the SVG container
    const container = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    const g = container.append("g")

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(["hiring", "skill", "company"])
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", d => {
        switch(d) {
          case "hiring": return "#00d4ff"
          case "skill": return "#f97316"
          case "company": return "#8b5cf6"
          default: return "#6b7280"
        }
      })

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", d => getLinkColor(d.type, 'css'))
      .attr("stroke-opacity", 0.8) // Increased opacity for better visibility
      .attr("stroke-width", d => Math.max(2, Math.sqrt(d.strength || 1) * 3)) // Thicker lines
      .attr("marker-end", d => `url(#arrow-${d.type})`)

    // Create node groups
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // Add circles for nodes
    node.append("circle")
      .attr("r", d => {
        switch(d.type) {
          case "company": return 25
          case "authority": return 20
          case "jobSeeker": return 15
          case "skill": return 10
          default: return 12
        }
      })
      .attr("fill", d => getNodeColor(d.type, 'css'))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // Add labels
    node.append("text")
      .text(d => d.name || d.id)
      .attr("x", 0)
      .attr("y", d => {
        switch(d.type) {
          case "company": return 35
          case "authority": return 30
          case "jobSeeker": return 25
          case "skill": return 20
          default: return 22
        }
      })
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, system-ui, -apple-system, sans-serif")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "#1f2937")
      .style("text-shadow", "0 1px 2px rgba(255, 255, 255, 0.8)")

    // Add authority level indicators
    node.filter(d => d.type === "authority")
      .append("text")
      .text(d => d.level?.charAt(0) || "A")
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, system-ui, -apple-system, sans-serif")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("fill", "#ffffff")
      .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.3)")

    // Add company size indicators
    node.filter(d => d.type === "company")
      .append("text")
      .text(d => {
        if (d.employeeCount < 100) return "S"
        if (d.employeeCount < 1000) return "M"
        return "E"
      })
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, system-ui, -apple-system, sans-serif")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .attr("fill", "#ffffff")
      .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.3)")

    // Add hover effects
    node
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d => {
            const baseRadius = d.type === "company" ? 25 : d.type === "authority" ? 20 : d.type === "jobSeeker" ? 15 : 10
            return baseRadius * 1.2
          })
          .attr("stroke-width", 3)

        // Highlight connected links
        link
          .attr("stroke-opacity", l =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
          )
          .attr("stroke-width", l =>
            l.source.id === d.id || l.target.id === d.id ?
            Math.sqrt(l.strength || 1) * 3 : Math.sqrt(l.strength || 1) * 2
          )
      })
      .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d => {
            switch(d.type) {
              case "company": return 25
              case "authority": return 20
              case "jobSeeker": return 15
              case "skill": return 10
              default: return 12
            }
          })
          .attr("stroke-width", 2)

        // Reset link opacity
        link
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", d => Math.sqrt(d.strength || 1) * 2)
      })
      .on("click", function(event, d) {
        setSelectedNode(d)
      })

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

      node
        .attr("transform", d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }

  }, [data, width, height])

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ width: width, height: height }}
      ></svg>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">Network Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Companies (S/M/E = Size)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary-500"></div>
            <span>Hiring Authorities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Job Seekers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Skills</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
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
