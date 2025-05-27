// Advanced filtering utilities for comprehensive data exploration
// Provides filtering logic for all entity types and visualization data

/**
 * Apply advanced filters to entity data
 * @param {Array} data - Array of entities to filter
 * @param {Object} filters - Filter configuration object
 * @param {string} entityType - Type of entity being filtered
 * @returns {Array} Filtered data array
 */
export function applyAdvancedFilters(data, filters, entityType) {
  if (!data || !Array.isArray(data) || !filters) {
    return data || []
  }

  return data.filter(item => {
    // Entity Type Filter
    if (filters.entityTypes && filters.entityTypes.length > 0) {
      if (!filters.entityTypes.includes(item.type || entityType)) {
        return false
      }
    }

    // Geographic Filters
    if (filters.locations && filters.locations.length > 0) {
      const itemLocation = item.location || item.company?.location || ''
      if (!filters.locations.some(loc => 
        itemLocation.toLowerCase().includes(loc.toLowerCase())
      )) {
        return false
      }
    }

    // Remote Work Filter
    if (filters.remoteWork && filters.remoteWork !== 'all') {
      const isRemote = item.remote || item.remoteWork || false
      if (filters.remoteWork === 'remote' && !isRemote) return false
      if (filters.remoteWork === 'onsite' && isRemote) return false
    }

    // Industry Filters
    if (filters.companyIndustries && filters.companyIndustries.length > 0) {
      const itemIndustry = item.industry || item.company?.industry || ''
      if (!filters.companyIndustries.some(industry =>
        itemIndustry.toLowerCase().includes(industry.toLowerCase())
      )) {
        return false
      }
    }

    // Company Size Filters
    if (filters.companySizes && filters.companySizes.length > 0) {
      const itemSize = item.size || item.company?.size || ''
      if (!filters.companySizes.includes(itemSize)) {
        return false
      }
    }

    // Skill Category Filters
    if (filters.skillCategories && filters.skillCategories.length > 0) {
      if (entityType === 'skill') {
        if (!filters.skillCategories.includes(item.category)) {
          return false
        }
      } else if (item.skills) {
        // For entities with skills, check if any skill matches the categories
        const hasMatchingSkill = item.skills.some(skill => {
          const skillCategory = typeof skill === 'object' ? skill.category : null
          return skillCategory && filters.skillCategories.includes(skillCategory)
        })
        if (!hasMatchingSkill) return false
      }
    }

    // Experience Range Filter
    if (filters.experienceRange) {
      const experience = item.experience || item.yearsExperience || 0
      if (experience < filters.experienceRange.min || experience > filters.experienceRange.max) {
        return false
      }
    }

    // Match Score Range Filter
    if (filters.matchScoreRange && entityType === 'match') {
      const score = item.matchScore || item.score || 0
      if (score < filters.matchScoreRange.min || score > filters.matchScoreRange.max) {
        return false
      }
    }

    // Match Status Filter
    if (filters.matchStatus && filters.matchStatus !== 'all' && entityType === 'match') {
      if (item.status !== filters.matchStatus) {
        return false
      }
    }

    // Seniority Level Filters
    if (filters.seniorityLevels && filters.seniorityLevels.length > 0) {
      const level = item.level || item.seniorityLevel || ''
      if (!filters.seniorityLevels.some(seniority =>
        level.toLowerCase().includes(seniority.toLowerCase())
      )) {
        return false
      }
    }

    // Date Range Filter
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const itemDate = new Date(item.createdAt || item.dateCreated || item.updatedAt)
      if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) {
        return false
      }
      if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) {
        return false
      }
    }

    return true
  })
}

/**
 * Apply advanced filters to network visualization data
 * @param {Object} networkData - Network data with nodes and links
 * @param {Object} filters - Filter configuration object
 * @returns {Object} Filtered network data
 */
export function applyAdvancedFiltersToNetwork(networkData, filters) {
  if (!networkData || !networkData.nodes || !filters) {
    return networkData
  }

  // Filter nodes
  const filteredNodes = networkData.nodes.filter(node => {
    // Entity Type Filter
    if (filters.entityTypes && filters.entityTypes.length > 0) {
      if (!filters.entityTypes.includes(node.type)) {
        return false
      }
    }

    // Apply other filters based on node properties
    return applyAdvancedFilters([node], filters, node.type).length > 0
  })

  // Filter links to only include connections between remaining nodes
  const nodeIds = new Set(filteredNodes.map(node => node.id))
  const filteredLinks = networkData.links.filter(link => {
    // Check if both source and target nodes are still in the filtered set
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source
    const targetId = typeof link.target === 'object' ? link.target.id : link.target
    
    if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
      return false
    }

    // Connection Type Filter
    if (filters.connectionTypes && filters.connectionTypes.length > 0) {
      if (!filters.connectionTypes.includes(link.type)) {
        return false
      }
    }

    // Relationship Strength Filter
    if (filters.relationshipStrength) {
      const strength = link.strength || link.weight || link.value || 50
      if (strength < filters.relationshipStrength.min || strength > filters.relationshipStrength.max) {
        return false
      }
    }

    return true
  })

  return {
    ...networkData,
    nodes: filteredNodes,
    links: filteredLinks,
    stats: {
      ...networkData.stats,
      totalNodes: filteredNodes.length,
      totalLinks: filteredLinks.length,
      filteredFrom: {
        originalNodes: networkData.nodes.length,
        originalLinks: networkData.links.length
      }
    }
  }
}

/**
 * Get filter suggestions based on current data
 * @param {Array} data - Data to analyze for filter suggestions
 * @param {string} entityType - Type of entity
 * @returns {Object} Filter suggestions
 */
export function getFilterSuggestions(data, entityType) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {}
  }

  const suggestions = {
    locations: [],
    industries: [],
    skillCategories: [],
    companySizes: [],
    seniorityLevels: [],
    connectionTypes: []
  }

  // Analyze data to extract unique values
  data.forEach(item => {
    // Locations
    const location = item.location || item.company?.location
    if (location && !suggestions.locations.includes(location)) {
      suggestions.locations.push(location)
    }

    // Industries
    const industry = item.industry || item.company?.industry
    if (industry && !suggestions.industries.includes(industry)) {
      suggestions.industries.push(industry)
    }

    // Skill Categories
    if (item.category && !suggestions.skillCategories.includes(item.category)) {
      suggestions.skillCategories.push(item.category)
    }

    // Company Sizes
    const size = item.size || item.company?.size
    if (size && !suggestions.companySizes.includes(size)) {
      suggestions.companySizes.push(size)
    }

    // Seniority Levels
    const level = item.level || item.seniorityLevel
    if (level && !suggestions.seniorityLevels.includes(level)) {
      suggestions.seniorityLevels.push(level)
    }
  })

  // Sort suggestions
  Object.keys(suggestions).forEach(key => {
    suggestions[key].sort()
  })

  return suggestions
}

/**
 * Create filter preset configurations for common use cases
 * @param {string} presetName - Name of the preset
 * @returns {Object} Filter configuration
 */
export function getFilterPreset(presetName) {
  const presets = {
    'high-quality-matches': {
      matchScoreRange: { min: 80, max: 100 },
      matchStatus: 'all',
      entityTypes: ['match']
    },
    'senior-positions': {
      seniorityLevels: ['Senior', 'Lead', 'Executive'],
      entityTypes: ['position', 'authority']
    },
    'tech-skills': {
      skillCategories: ['Programming', 'Software Development', 'Data Science', 'DevOps'],
      entityTypes: ['skill', 'jobSeeker']
    },
    'remote-opportunities': {
      remoteWork: 'remote',
      entityTypes: ['position']
    },
    'startup-ecosystem': {
      companySizes: ['Startup', 'Small'],
      entityTypes: ['company', 'position', 'authority']
    },
    'enterprise-level': {
      companySizes: ['Large', 'Enterprise'],
      entityTypes: ['company', 'position', 'authority']
    }
  }

  return presets[presetName] || {}
}

/**
 * Validate filter configuration
 * @param {Object} filters - Filter configuration to validate
 * @returns {Object} Validation result with errors and warnings
 */
export function validateFilters(filters) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check for logical inconsistencies
  if (filters.relationshipStrength) {
    if (filters.relationshipStrength.min > filters.relationshipStrength.max) {
      result.errors.push('Minimum relationship strength cannot be greater than maximum')
      result.isValid = false
    }
  }

  if (filters.experienceRange) {
    if (filters.experienceRange.min > filters.experienceRange.max) {
      result.errors.push('Minimum experience cannot be greater than maximum')
      result.isValid = false
    }
  }

  if (filters.matchScoreRange) {
    if (filters.matchScoreRange.min > filters.matchScoreRange.max) {
      result.errors.push('Minimum match score cannot be greater than maximum')
      result.isValid = false
    }
  }

  // Check for overly restrictive filters
  if (filters.entityTypes && filters.entityTypes.length === 0) {
    result.warnings.push('No entity types selected - this will show no results')
  }

  if (filters.connectionTypes && filters.connectionTypes.length === 0) {
    result.warnings.push('No connection types selected - this may limit network visualization')
  }

  return result
}

export default {
  applyAdvancedFilters,
  applyAdvancedFiltersToNetwork,
  getFilterSuggestions,
  getFilterPreset,
  validateFilters
}
