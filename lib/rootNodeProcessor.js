// Root Node Processor - Enhanced visualization with context-aware root node emphasis
// Handles root node identification, emphasis, and relationship hierarchy

import { NODE_COLORS, LINK_COLORS } from './visualizationConstants'

/**
 * Process network data to emphasize a specific root node and organize connections
 * @param {Object} networkData - Raw network data with nodes and links
 * @param {string} rootNodeId - ID of the node to emphasize as root
 * @param {Object} options - Processing options
 * @returns {Object} Enhanced network data with root node emphasis
 */
export function processRootNodeVisualization(networkData, rootNodeId, options = {}) {
  const {
    emphasisMultiplier = 2.0,
    maxDistance = 3,
    showSecondaryConnections = true,
    layoutType = 'radial' // 'radial', 'hierarchical', 'force'
  } = options

  if (!networkData || !networkData.nodes || !rootNodeId) {
    return networkData
  }

  // Find the root node
  const rootNode = networkData.nodes.find(node => node.id === rootNodeId)
  if (!rootNode) {
    console.warn(`Root node ${rootNodeId} not found in network data`)
    return networkData
  }

  // Calculate distances from root node
  const distances = calculateNodeDistances(networkData, rootNodeId, maxDistance)
  
  // Process nodes with root emphasis
  const processedNodes = networkData.nodes.map(node => {
    const distance = distances[node.id]
    const isRoot = node.id === rootNodeId
    
    return {
      ...node,
      // Root node emphasis
      isRoot,
      distance,
      
      // Enhanced visual properties
      size: isRoot 
        ? (node.size || 10) * emphasisMultiplier 
        : calculateNodeSize(node, distance),
      
      color: isRoot 
        ? enhanceRootColor(node.color || NODE_COLORS[node.type]?.css)
        : calculateNodeColor(node, distance),
      
      opacity: calculateNodeOpacity(distance, maxDistance),
      
      // Layout positioning hints
      layoutHints: calculateLayoutHints(node, rootNode, distance, layoutType),
      
      // Interaction properties
      clickable: true,
      hoverable: true,
      contextSwitchable: distance <= 2 // Allow context switching for nearby nodes
    }
  })

  // Process links with emphasis
  const processedLinks = networkData.links.map(link => {
    const sourceDistance = distances[link.source] || distances[link.source?.id]
    const targetDistance = distances[link.target] || distances[link.target?.id]
    const isRootConnection = sourceDistance === 0 || targetDistance === 0
    const maxLinkDistance = Math.max(sourceDistance || Infinity, targetDistance || Infinity)
    
    return {
      ...link,
      // Connection emphasis
      isRootConnection,
      maxDistance: maxLinkDistance,
      
      // Enhanced visual properties
      width: isRootConnection 
        ? (link.width || 2) * 1.5 
        : calculateLinkWidth(link, maxLinkDistance),
      
      color: isRootConnection 
        ? enhanceRootLinkColor(link.color || LINK_COLORS[link.type]?.css)
        : calculateLinkColor(link, maxLinkDistance),
      
      opacity: calculateLinkOpacity(maxLinkDistance, maxDistance),
      
      // Interaction properties
      hoverable: maxLinkDistance <= 2,
      strength: calculateLinkStrength(link, isRootConnection)
    }
  })

  // Filter out distant connections if needed
  const filteredNodes = processedNodes.filter(node => 
    node.distance <= maxDistance || node.isRoot
  )
  
  const filteredLinks = processedLinks.filter(link => {
    const sourceId = link.source?.id || link.source
    const targetId = link.target?.id || link.target
    const sourceIncluded = filteredNodes.some(n => n.id === sourceId)
    const targetIncluded = filteredNodes.some(n => n.id === targetId)
    return sourceIncluded && targetIncluded
  })

  return {
    ...networkData,
    nodes: filteredNodes,
    links: filteredLinks,
    rootNode: processedNodes.find(n => n.isRoot),
    stats: {
      ...networkData.stats,
      rootNodeId,
      totalDistance: maxDistance,
      nodesAtDistance: calculateDistanceDistribution(distances, maxDistance),
      rootConnections: filteredLinks.filter(l => l.isRootConnection).length
    }
  }
}

/**
 * Calculate shortest path distances from root node to all other nodes
 */
function calculateNodeDistances(networkData, rootNodeId, maxDistance) {
  const distances = { [rootNodeId]: 0 }
  const queue = [rootNodeId]
  const visited = new Set([rootNodeId])

  while (queue.length > 0) {
    const currentId = queue.shift()
    const currentDistance = distances[currentId]

    if (currentDistance >= maxDistance) continue

    // Find all connected nodes
    const connectedNodes = networkData.links
      .filter(link => {
        const sourceId = link.source?.id || link.source
        const targetId = link.target?.id || link.target
        return sourceId === currentId || targetId === currentId
      })
      .map(link => {
        const sourceId = link.source?.id || link.source
        const targetId = link.target?.id || link.target
        return sourceId === currentId ? targetId : sourceId
      })

    connectedNodes.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        distances[nodeId] = currentDistance + 1
        visited.add(nodeId)
        queue.push(nodeId)
      }
    })
  }

  return distances
}

/**
 * Calculate enhanced node size based on distance from root
 */
function calculateNodeSize(node, distance) {
  const baseSize = node.size || 10
  const distanceMultiplier = Math.max(0.3, 1 - (distance * 0.2))
  return baseSize * distanceMultiplier
}

/**
 * Calculate node color with distance-based fading
 */
function calculateNodeColor(node, distance) {
  const baseColor = node.color || NODE_COLORS[node.type]?.css || '#6366f1'
  
  if (distance === undefined || distance === Infinity) {
    return adjustColorOpacity(baseColor, 0.3)
  }
  
  const opacity = Math.max(0.4, 1 - (distance * 0.2))
  return adjustColorOpacity(baseColor, opacity)
}

/**
 * Calculate node opacity based on distance
 */
function calculateNodeOpacity(distance, maxDistance) {
  if (distance === undefined || distance === Infinity) return 0.3
  return Math.max(0.4, 1 - (distance / maxDistance) * 0.6)
}

/**
 * Calculate layout positioning hints for different layout types
 */
function calculateLayoutHints(node, rootNode, distance, layoutType) {
  switch (layoutType) {
    case 'radial':
      return calculateRadialPosition(node, rootNode, distance)
    case 'hierarchical':
      return calculateHierarchicalPosition(node, rootNode, distance)
    case 'force':
    default:
      return { preferredDistance: distance * 50 }
  }
}

/**
 * Calculate radial positioning for nodes
 */
function calculateRadialPosition(node, rootNode, distance) {
  if (distance === 0) {
    return { x: 0, y: 0, fixed: true }
  }
  
  const angle = (node.id.charCodeAt(0) * 137.5) % 360 // Golden angle distribution
  const radius = distance * 80
  
  return {
    x: Math.cos(angle * Math.PI / 180) * radius,
    y: Math.sin(angle * Math.PI / 180) * radius,
    angle,
    radius,
    preferredDistance: radius
  }
}

/**
 * Calculate hierarchical positioning for nodes
 */
function calculateHierarchicalPosition(node, rootNode, distance) {
  const typeOrder = ['company', 'authority', 'position', 'skill', 'jobSeeker']
  const typeIndex = typeOrder.indexOf(node.type)
  
  return {
    layer: distance,
    typeOrder: typeIndex,
    x: typeIndex * 100,
    y: distance * 100,
    preferredDistance: distance * 60
  }
}

/**
 * Enhance root node color with increased saturation/brightness
 */
function enhanceRootColor(baseColor) {
  // Convert to HSL, increase saturation and lightness
  return adjustColorSaturation(baseColor, 1.3)
}

/**
 * Calculate link width based on distance and importance
 */
function calculateLinkWidth(link, maxDistance) {
  const baseWidth = link.width || 2
  const distanceMultiplier = Math.max(0.5, 1 - (maxDistance * 0.15))
  return baseWidth * distanceMultiplier
}

/**
 * Calculate link color with distance-based adjustments
 */
function calculateLinkColor(link, maxDistance) {
  const baseColor = link.color || LINK_COLORS[link.type]?.css || '#6b7280'
  const opacity = Math.max(0.3, 1 - (maxDistance * 0.2))
  return adjustColorOpacity(baseColor, opacity)
}

/**
 * Calculate link opacity based on distance
 */
function calculateLinkOpacity(maxDistance, totalMaxDistance) {
  if (maxDistance === undefined || maxDistance === Infinity) return 0.2
  return Math.max(0.2, 1 - (maxDistance / totalMaxDistance) * 0.7)
}

/**
 * Enhance root connection link colors
 */
function enhanceRootLinkColor(baseColor) {
  return adjustColorSaturation(baseColor, 1.2)
}

/**
 * Calculate link strength for force simulations
 */
function calculateLinkStrength(link, isRootConnection) {
  const baseStrength = link.strength || 0.5
  return isRootConnection ? baseStrength * 1.5 : baseStrength
}

/**
 * Calculate distribution of nodes at each distance level
 */
function calculateDistanceDistribution(distances, maxDistance) {
  const distribution = {}
  for (let i = 0; i <= maxDistance; i++) {
    distribution[i] = 0
  }
  
  Object.values(distances).forEach(distance => {
    if (distance <= maxDistance) {
      distribution[distance]++
    }
  })
  
  return distribution
}

/**
 * Utility function to adjust color opacity
 */
function adjustColorOpacity(color, opacity) {
  // Simple implementation - in production, use a proper color library
  if (color.startsWith('#')) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
    return color + alpha
  }
  return color
}

/**
 * Utility function to adjust color saturation
 */
function adjustColorSaturation(color, multiplier) {
  // Simple implementation - in production, use a proper color library
  return color // For now, return as-is
}

export default processRootNodeVisualization
