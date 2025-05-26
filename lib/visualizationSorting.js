// Visualization Sorting Engine - Advanced sorting algorithms for network visualizations
// Provides multiple sorting strategies for organizing nodes around a root node

/**
 * Available sorting methods for visualization nodes
 */
export const SORTING_METHODS = {
  RELATIONSHIP_STRENGTH: 'relationship_strength',
  ENTITY_TYPE: 'entity_type',
  ALPHABETICAL: 'alphabetical',
  TEMPORAL: 'temporal',
  DISTANCE: 'distance',
  CUSTOM_IMPORTANCE: 'custom_importance',
  MATCH_SCORE: 'match_score',
  HIERARCHY_LEVEL: 'hierarchy_level'
}

/**
 * Sort network nodes based on specified method and root node context
 * @param {Array} nodes - Array of network nodes
 * @param {Array} links - Array of network links
 * @param {string} rootNodeId - ID of the root node
 * @param {string} sortMethod - Sorting method from SORTING_METHODS
 * @param {Object} options - Additional sorting options
 * @returns {Array} Sorted array of nodes
 */
export function sortNetworkNodes(nodes, links, rootNodeId, sortMethod, options = {}) {
  if (!nodes || !Array.isArray(nodes)) return []
  
  const {
    ascending = false,
    secondarySort = SORTING_METHODS.ALPHABETICAL,
    filterTypes = null, // Array of entity types to include
    maxResults = null
  } = options

  // Find root node
  const rootNode = nodes.find(node => node.id === rootNodeId)
  if (!rootNode) {
    console.warn(`Root node ${rootNodeId} not found for sorting`)
    return nodes
  }

  // Filter by entity types if specified
  let filteredNodes = filterTypes 
    ? nodes.filter(node => filterTypes.includes(node.type))
    : nodes

  // Apply primary sorting
  let sortedNodes = applySortingMethod(filteredNodes, links, rootNode, sortMethod, options)

  // Apply secondary sorting for ties
  if (secondarySort && secondarySort !== sortMethod) {
    sortedNodes = applySecondarySorting(sortedNodes, links, rootNode, secondarySort)
  }

  // Apply sort direction
  if (ascending) {
    sortedNodes.reverse()
  }

  // Limit results if specified
  if (maxResults && maxResults > 0) {
    sortedNodes = sortedNodes.slice(0, maxResults)
  }

  return sortedNodes
}

/**
 * Apply specific sorting method to nodes
 */
function applySortingMethod(nodes, links, rootNode, sortMethod, options) {
  switch (sortMethod) {
    case SORTING_METHODS.RELATIONSHIP_STRENGTH:
      return sortByRelationshipStrength(nodes, links, rootNode)
    
    case SORTING_METHODS.ENTITY_TYPE:
      return sortByEntityType(nodes, options.typeOrder)
    
    case SORTING_METHODS.ALPHABETICAL:
      return sortAlphabetically(nodes)
    
    case SORTING_METHODS.TEMPORAL:
      return sortByTemporal(nodes, options.timeField)
    
    case SORTING_METHODS.DISTANCE:
      return sortByDistance(nodes, rootNode)
    
    case SORTING_METHODS.CUSTOM_IMPORTANCE:
      return sortByCustomImportance(nodes, options.importanceField)
    
    case SORTING_METHODS.MATCH_SCORE:
      return sortByMatchScore(nodes, links, rootNode)
    
    case SORTING_METHODS.HIERARCHY_LEVEL:
      return sortByHierarchyLevel(nodes, options.hierarchyField)
    
    default:
      console.warn(`Unknown sorting method: ${sortMethod}`)
      return nodes
  }
}

/**
 * Sort nodes by relationship strength to root node
 */
function sortByRelationshipStrength(nodes, links, rootNode) {
  const strengthMap = calculateRelationshipStrengths(links, rootNode.id)
  
  return nodes.sort((a, b) => {
    const strengthA = strengthMap[a.id] || 0
    const strengthB = strengthMap[b.id] || 0
    
    // Root node always first
    if (a.id === rootNode.id) return -1
    if (b.id === rootNode.id) return 1
    
    return strengthB - strengthA
  })
}

/**
 * Sort nodes by entity type hierarchy
 */
function sortByEntityType(nodes, customTypeOrder = null) {
  const defaultTypeOrder = ['company', 'authority', 'position', 'skill', 'jobSeeker']
  const typeOrder = customTypeOrder || defaultTypeOrder
  
  return nodes.sort((a, b) => {
    const orderA = typeOrder.indexOf(a.type)
    const orderB = typeOrder.indexOf(b.type)
    
    // Unknown types go to end
    const finalOrderA = orderA === -1 ? typeOrder.length : orderA
    const finalOrderB = orderB === -1 ? typeOrder.length : orderB
    
    return finalOrderA - finalOrderB
  })
}

/**
 * Sort nodes alphabetically by name
 */
function sortAlphabetically(nodes) {
  return nodes.sort((a, b) => {
    const nameA = (a.name || a.title || '').toLowerCase()
    const nameB = (b.name || b.title || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

/**
 * Sort nodes by temporal data (creation date, last activity, etc.)
 */
function sortByTemporal(nodes, timeField = 'createdAt') {
  return nodes.sort((a, b) => {
    const timeA = new Date(a[timeField] || 0)
    const timeB = new Date(b[timeField] || 0)
    return timeB - timeA // Most recent first
  })
}

/**
 * Sort nodes by distance from root node
 */
function sortByDistance(nodes, rootNode) {
  return nodes.sort((a, b) => {
    const distanceA = a.distance !== undefined ? a.distance : Infinity
    const distanceB = b.distance !== undefined ? b.distance : Infinity
    
    // Root node always first
    if (a.id === rootNode.id) return -1
    if (b.id === rootNode.id) return 1
    
    return distanceA - distanceB
  })
}

/**
 * Sort nodes by custom importance field
 */
function sortByCustomImportance(nodes, importanceField = 'importance') {
  return nodes.sort((a, b) => {
    const importanceA = a[importanceField] || 0
    const importanceB = b[importanceField] || 0
    return importanceB - importanceA
  })
}

/**
 * Sort nodes by match score with root node
 */
function sortByMatchScore(nodes, links, rootNode) {
  const matchScores = calculateMatchScores(links, rootNode.id)
  
  return nodes.sort((a, b) => {
    const scoreA = matchScores[a.id] || 0
    const scoreB = matchScores[b.id] || 0
    
    // Root node always first
    if (a.id === rootNode.id) return -1
    if (b.id === rootNode.id) return 1
    
    return scoreB - scoreA
  })
}

/**
 * Sort nodes by hierarchy level (for organizational structures)
 */
function sortByHierarchyLevel(nodes, hierarchyField = 'level') {
  const levelOrder = ['C-Suite', 'Executive', 'Director', 'Manager', 'Individual']
  
  return nodes.sort((a, b) => {
    const levelA = a[hierarchyField] || 'Individual'
    const levelB = b[hierarchyField] || 'Individual'
    
    const orderA = levelOrder.indexOf(levelA)
    const orderB = levelOrder.indexOf(levelB)
    
    const finalOrderA = orderA === -1 ? levelOrder.length : orderA
    const finalOrderB = orderB === -1 ? levelOrder.length : orderB
    
    return finalOrderA - finalOrderB
  })
}

/**
 * Apply secondary sorting for tie-breaking
 */
function applySecondarySorting(nodes, links, rootNode, secondarySort) {
  // Group nodes by their primary sort value, then apply secondary sort within groups
  const groups = new Map()
  
  nodes.forEach((node, index) => {
    const groupKey = index // Simple grouping by current position
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey).push(node)
  })
  
  // Apply secondary sort within each group
  const sortedGroups = Array.from(groups.values()).map(group => 
    applySortingMethod(group, links, rootNode, secondarySort, {})
  )
  
  return sortedGroups.flat()
}

/**
 * Calculate relationship strengths between root node and all other nodes
 */
function calculateRelationshipStrengths(links, rootNodeId) {
  const strengths = {}
  
  links.forEach(link => {
    const sourceId = link.source?.id || link.source
    const targetId = link.target?.id || link.target
    const strength = link.strength || link.value || 1
    
    if (sourceId === rootNodeId) {
      strengths[targetId] = (strengths[targetId] || 0) + strength
    } else if (targetId === rootNodeId) {
      strengths[sourceId] = (strengths[sourceId] || 0) + strength
    }
  })
  
  return strengths
}

/**
 * Calculate match scores between root node and all other nodes
 */
function calculateMatchScores(links, rootNodeId) {
  const scores = {}
  
  links.forEach(link => {
    const sourceId = link.source?.id || link.source
    const targetId = link.target?.id || link.target
    
    // Look for match-type links with scores
    if (link.type === 'match' || link.type === 'matched_to') {
      const score = link.score || link.matchScore || link.compatibility_score || 0
      
      if (sourceId === rootNodeId) {
        scores[targetId] = Math.max(scores[targetId] || 0, score)
      } else if (targetId === rootNodeId) {
        scores[sourceId] = Math.max(scores[sourceId] || 0, score)
      }
    }
  })
  
  return scores
}

/**
 * Get available sorting methods for a specific entity type
 */
export function getAvailableSortingMethods(entityType) {
  const baseMethods = [
    SORTING_METHODS.ALPHABETICAL,
    SORTING_METHODS.DISTANCE,
    SORTING_METHODS.ENTITY_TYPE
  ]
  
  switch (entityType) {
    case 'jobSeeker':
      return [
        ...baseMethods,
        SORTING_METHODS.MATCH_SCORE,
        SORTING_METHODS.RELATIONSHIP_STRENGTH,
        SORTING_METHODS.TEMPORAL
      ]
    
    case 'authority':
      return [
        ...baseMethods,
        SORTING_METHODS.HIERARCHY_LEVEL,
        SORTING_METHODS.MATCH_SCORE,
        SORTING_METHODS.RELATIONSHIP_STRENGTH
      ]
    
    case 'company':
      return [
        ...baseMethods,
        SORTING_METHODS.CUSTOM_IMPORTANCE,
        SORTING_METHODS.RELATIONSHIP_STRENGTH,
        SORTING_METHODS.TEMPORAL
      ]
    
    case 'skill':
      return [
        ...baseMethods,
        SORTING_METHODS.CUSTOM_IMPORTANCE,
        SORTING_METHODS.RELATIONSHIP_STRENGTH
      ]
    
    case 'position':
      return [
        ...baseMethods,
        SORTING_METHODS.HIERARCHY_LEVEL,
        SORTING_METHODS.TEMPORAL,
        SORTING_METHODS.RELATIONSHIP_STRENGTH
      ]
    
    default:
      return baseMethods
  }
}

/**
 * Get human-readable labels for sorting methods
 */
export function getSortingMethodLabel(method) {
  const labels = {
    [SORTING_METHODS.RELATIONSHIP_STRENGTH]: 'Connection Strength',
    [SORTING_METHODS.ENTITY_TYPE]: 'Entity Type',
    [SORTING_METHODS.ALPHABETICAL]: 'Alphabetical',
    [SORTING_METHODS.TEMPORAL]: 'Most Recent',
    [SORTING_METHODS.DISTANCE]: 'Distance from Root',
    [SORTING_METHODS.CUSTOM_IMPORTANCE]: 'Importance',
    [SORTING_METHODS.MATCH_SCORE]: 'Match Score',
    [SORTING_METHODS.HIERARCHY_LEVEL]: 'Hierarchy Level'
  }
  
  return labels[method] || method
}

export default {
  sortNetworkNodes,
  SORTING_METHODS,
  getAvailableSortingMethods,
  getSortingMethodLabel
}
