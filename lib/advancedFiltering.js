// Advanced filtering utilities for comprehensive data exploration
// Provides filtering logic for all entity types and visualization data
// Enhanced with intelligent suggestions and real-time filtering

import { mobileDetector } from './mobileAnimations'

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

/**
 * Intelligent Filter Engine with real-time suggestions and state management
 */
export class IntelligentFilterEngine {
  constructor() {
    this.filters = new Map()
    this.filterHistory = []
    this.suggestions = new Map()
    this.callbacks = new Set()
    this.debounceTimeout = null
    this.isProcessing = false
    this.presets = new Map()
    this.initializePresets()
  }

  /**
   * Initialize common filter presets
   */
  initializePresets() {
    const presets = {
      'high-quality-matches': {
        name: 'High Quality Matches',
        description: 'Show only matches with 80%+ compatibility',
        filters: {
          matchScoreRange: { min: 80, max: 100 },
          entityTypes: ['match']
        }
      },
      'senior-positions': {
        name: 'Senior Positions',
        description: 'Leadership and senior-level opportunities',
        filters: {
          seniorityLevels: ['Senior', 'Lead', 'Executive'],
          entityTypes: ['position', 'authority']
        }
      },
      'tech-focused': {
        name: 'Technology Focus',
        description: 'Technical skills and positions',
        filters: {
          skillCategories: ['Programming', 'Software Development', 'Data Science'],
          entityTypes: ['skill', 'jobSeeker', 'position']
        }
      },
      'remote-work': {
        name: 'Remote Opportunities',
        description: 'Remote and distributed work options',
        filters: {
          remoteWork: 'remote',
          entityTypes: ['position']
        }
      }
    }

    for (const [id, preset] of Object.entries(presets)) {
      this.presets.set(id, preset)
    }
  }

  /**
   * Apply a filter preset
   */
  applyPreset(presetId) {
    const preset = this.presets.get(presetId)
    if (!preset) return false

    // Clear existing filters
    this.clearAllFilters()

    // Apply preset filters
    for (const [filterId, value] of Object.entries(preset.filters)) {
      this.setFilter(filterId, value, { skipHistory: true })
    }

    // Add to history as a single action
    this.filterHistory.push({
      action: 'preset_applied',
      presetId,
      presetName: preset.name,
      timestamp: Date.now()
    })

    this.triggerCallbacks(true)
    return true
  }

  /**
   * Get available presets
   */
  getPresets() {
    return Array.from(this.presets.entries()).map(([id, preset]) => ({
      id,
      ...preset
    }))
  }

  /**
   * Set filter with intelligent validation and suggestions
   */
  setFilter(filterId, value, options = {}) {
    // Store filter state
    const previousState = this.getFilterState()

    // Update filter
    const filter = {
      id: filterId,
      value,
      timestamp: Date.now(),
      isActive: value !== null && value !== undefined && value !== ''
    }

    this.filters.set(filterId, filter)

    // Add to history
    if (!options.skipHistory) {
      this.filterHistory.push({
        action: 'filter_changed',
        filterId,
        previousValue: previousState.activeFilters[filterId]?.value,
        newValue: value,
        timestamp: Date.now()
      })

      // Keep history manageable
      if (this.filterHistory.length > 50) {
        this.filterHistory = this.filterHistory.slice(-25)
      }
    }

    // Generate intelligent suggestions
    this.generateIntelligentSuggestions(filterId, value)

    // Trigger callbacks with debouncing
    this.triggerCallbacks(options.immediate)

    return true
  }

  /**
   * Generate intelligent suggestions based on current filter state
   */
  generateIntelligentSuggestions(changedFilterId, value) {
    const activeFilters = this.getActiveFilters()
    const suggestions = new Map()

    // Generate contextual suggestions
    if (changedFilterId === 'skillCategories' && value?.length > 0) {
      // Suggest related entity types
      suggestions.set('entityTypes', {
        suggestions: ['jobSeeker', 'position'],
        reason: 'Show people and positions with these skills',
        priority: 'high'
      })

      // Suggest experience ranges based on skill complexity
      const hasAdvancedSkills = value.some(skill =>
        ['Data Science', 'Machine Learning', 'DevOps'].includes(skill)
      )
      if (hasAdvancedSkills) {
        suggestions.set('experienceRange', {
          suggestions: [{ min: 3, max: 15 }],
          reason: 'Advanced skills typically require 3+ years experience',
          priority: 'medium'
        })
      }
    }

    if (changedFilterId === 'companySizes' && value?.includes('Startup')) {
      // Suggest remote work for startups
      suggestions.set('remoteWork', {
        suggestions: ['remote', 'hybrid'],
        reason: 'Startups often offer flexible work arrangements',
        priority: 'medium'
      })
    }

    if (changedFilterId === 'seniorityLevels' && value?.some(level =>
      ['Senior', 'Lead', 'Executive'].includes(level)
    )) {
      // Suggest higher experience ranges
      suggestions.set('experienceRange', {
        suggestions: [{ min: 5, max: 20 }],
        reason: 'Senior roles typically require 5+ years experience',
        priority: 'high'
      })
    }

    // Store suggestions
    this.suggestions.set('intelligent', suggestions)
  }

  /**
   * Get active filters
   */
  getActiveFilters() {
    const activeFilters = {}
    for (const [id, filter] of this.filters) {
      if (filter.isActive) {
        activeFilters[id] = filter
      }
    }
    return activeFilters
  }

  /**
   * Clear specific filter
   */
  clearFilter(filterId) {
    this.setFilter(filterId, null)
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    for (const [filterId] of this.filters) {
      this.filters.delete(filterId)
    }
    this.suggestions.clear()
    this.triggerCallbacks(true)
  }

  /**
   * Subscribe to filter changes
   */
  subscribe(callback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * Trigger callbacks with debouncing
   */
  triggerCallbacks(immediate = false) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    const delay = immediate ? 0 : (mobileDetector.isMobile ? 150 : 100)

    this.debounceTimeout = setTimeout(() => {
      if (this.isProcessing) return

      this.isProcessing = true
      const filterState = this.getFilterState()

      this.callbacks.forEach(callback => {
        try {
          callback(filterState)
        } catch (error) {
          console.error('Filter callback error:', error)
        }
      })

      this.isProcessing = false
    }, delay)
  }

  /**
   * Get complete filter state
   */
  getFilterState() {
    const activeFilters = this.getActiveFilters()

    return {
      activeFilters,
      allFilters: Object.fromEntries(this.filters),
      suggestions: Object.fromEntries(this.suggestions),
      history: this.filterHistory.slice(-10),
      presets: this.getPresets(),
      stats: {
        activeCount: Object.keys(activeFilters).length,
        totalCount: this.filters.size,
        hasActiveFilters: Object.keys(activeFilters).length > 0
      }
    }
  }

  /**
   * Export state for persistence
   */
  exportState() {
    const state = {}
    for (const [id, filter] of this.filters) {
      if (filter.isActive) {
        state[id] = filter.value
      }
    }
    return state
  }

  /**
   * Import state from persistence
   */
  importState(state) {
    this.clearAllFilters()
    for (const [filterId, value] of Object.entries(state)) {
      this.setFilter(filterId, value, { skipHistory: true })
    }
    this.triggerCallbacks(true)
  }

  /**
   * Get filter suggestions for autocomplete
   */
  getAutocompleteSuggestions(filterId, query) {
    // This would typically connect to backend for real suggestions
    // For now, return mock suggestions based on filter type
    const mockSuggestions = {
      locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'],
      industries: ['Technology', 'Healthcare', 'Finance', 'Education'],
      skillCategories: ['Programming', 'Design', 'Marketing', 'Sales']
    }

    const suggestions = mockSuggestions[filterId] || []
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }
}

// Global intelligent filter engine
export const intelligentFilterEngine = new IntelligentFilterEngine()

// Enhanced utility functions
export function useIntelligentFilters() {
  return {
    setFilter: (id, value) => intelligentFilterEngine.setFilter(id, value),
    clearFilter: (id) => intelligentFilterEngine.clearFilter(id),
    clearAll: () => intelligentFilterEngine.clearAllFilters(),
    applyPreset: (presetId) => intelligentFilterEngine.applyPreset(presetId),
    getState: () => intelligentFilterEngine.getFilterState(),
    getPresets: () => intelligentFilterEngine.getPresets(),
    getSuggestions: (filterId, query) => intelligentFilterEngine.getAutocompleteSuggestions(filterId, query),
    subscribe: (callback) => intelligentFilterEngine.subscribe(callback),
    exportState: () => intelligentFilterEngine.exportState(),
    importState: (state) => intelligentFilterEngine.importState(state)
  }
}

export default {
  applyAdvancedFilters,
  applyAdvancedFiltersToNetwork,
  getFilterSuggestions,
  getFilterPreset,
  validateFilters,
  IntelligentFilterEngine,
  intelligentFilterEngine,
  useIntelligentFilters
}
