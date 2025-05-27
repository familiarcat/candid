// Advanced filtering hook for comprehensive data exploration
// Manages filter state and provides filtering utilities

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  applyAdvancedFilters,
  applyAdvancedFiltersToNetwork,
  getFilterSuggestions,
  getFilterPreset,
  validateFilters
} from '../lib/advancedFiltering'
import {
  filterCache,
  debounce,
  optimizeFiltering,
  performanceMonitor
} from '../lib/performanceOptimizations'

/**
 * Hook for managing advanced filtering functionality
 * @param {Array} data - Data to filter
 * @param {string} entityType - Type of entity being filtered
 * @param {Object} options - Configuration options
 * @returns {Object} Filter state and utilities
 */
export function useAdvancedFilters(data = [], entityType = 'all', options = {}) {
  const {
    enableNetworkFiltering = false,
    persistFilters = false,
    storageKey = `advanced-filters-${entityType}`,
    onFiltersChange = () => {}
  } = options

  // Initialize filters from localStorage if persistence is enabled
  const getInitialFilters = () => {
    const defaultFilters = {
      // Entity Type Filters
      entityTypes: ['company', 'authority', 'jobSeeker', 'skill', 'position'],

      // Relationship Filters
      relationshipStrength: { min: 0, max: 100 },
      connectionTypes: ['employment', 'match', 'skill', 'requirement'],

      // Temporal Filters
      dateRange: { start: null, end: null },
      activityLevel: 'all',

      // Geographic Filters
      locations: [],
      remoteWork: 'all',

      // Skill-Based Filters
      skillCategories: [],
      skillLevels: [],

      // Company-Based Filters
      companyIndustries: [],
      companySizes: [],

      // Match Quality Filters
      matchScoreRange: { min: 0, max: 100 },
      matchStatus: 'all',

      // Experience Filters
      experienceRange: { min: 0, max: 20 },
      seniorityLevels: []
    }

    if (persistFilters && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          return { ...defaultFilters, ...JSON.parse(stored) }
        }
      } catch (error) {
        console.warn('Failed to load stored filters:', error)
      }
    }

    return defaultFilters
  }

  const [filters, setFilters] = useState(getInitialFilters)
  const [isActive, setIsActive] = useState(false)

  // Persist filters to localStorage when they change
  useEffect(() => {
    if (persistFilters && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to save filters:', error)
      }
    }
  }, [filters, persistFilters, storageKey])

  // Notify parent component of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  // Check if any filters are active (non-default)
  useEffect(() => {
    const hasActiveFilters = (
      filters.entityTypes.length < 5 ||
      filters.relationshipStrength.min > 0 ||
      filters.relationshipStrength.max < 100 ||
      filters.connectionTypes.length < 4 ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.activityLevel !== 'all' ||
      filters.locations.length > 0 ||
      filters.remoteWork !== 'all' ||
      filters.skillCategories.length > 0 ||
      filters.skillLevels.length > 0 ||
      filters.companyIndustries.length > 0 ||
      filters.companySizes.length > 0 ||
      filters.matchScoreRange.min > 0 ||
      filters.matchScoreRange.max < 100 ||
      filters.matchStatus !== 'all' ||
      filters.experienceRange.min > 0 ||
      filters.experienceRange.max < 20 ||
      filters.seniorityLevels.length > 0
    )
    setIsActive(hasActiveFilters)
  }, [filters])

  // Apply filters to data with caching and optimization
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return data

    // Generate cache key for this filter operation
    const cacheKey = `filter-${entityType}-${JSON.stringify(filters)}-${data.length}`

    // Check cache first
    const cachedResult = filterCache.get(cacheKey)
    if (cachedResult) {
      console.log(`📦 Using cached filter result for ${entityType}`)
      return cachedResult
    }

    console.log(`🔍 Applying filters to ${entityType} data...`)
    performanceMonitor.start(`filter-${entityType}`)

    let result
    if (enableNetworkFiltering && data.nodes && data.links) {
      // Apply network filtering
      result = applyAdvancedFiltersToNetwork(data, filters)
    } else {
      // Apply optimized entity filtering for large datasets
      if (data.length > 1000) {
        result = optimizeFiltering(data, filters, 500)
      } else {
        result = applyAdvancedFilters(data, filters, entityType)
      }
    }

    // Cache the result
    filterCache.set(cacheKey, result)

    const metrics = performanceMonitor.end(`filter-${entityType}`)
    console.log(`✅ Filtering complete for ${entityType}:`, {
      original: data.length,
      filtered: Array.isArray(result) ? result.length : result.nodes?.length || 0,
      metrics
    })

    return result
  }, [data, filters, entityType, enableNetworkFiltering])

  // Get filter suggestions based on current data
  const filterSuggestions = useMemo(() => {
    if (!data || data.length === 0) return {}

    const dataToAnalyze = enableNetworkFiltering && data.nodes ? data.nodes : data
    return getFilterSuggestions(dataToAnalyze, entityType)
  }, [data, entityType, enableNetworkFiltering])

  // Validate current filters
  const filterValidation = useMemo(() => {
    return validateFilters(filters)
  }, [filters])

  // Debounced filter update functions for better performance
  const debouncedUpdateFilter = useMemo(
    () => debounce((filterKey, value) => {
      setFilters(prev => ({
        ...prev,
        [filterKey]: value
      }))
    }, 300),
    []
  )

  const debouncedUpdateArrayFilter = useMemo(
    () => debounce((filterKey, value, checked) => {
      setFilters(prev => ({
        ...prev,
        [filterKey]: checked
          ? [...prev[filterKey], value]
          : prev[filterKey].filter(item => item !== value)
      }))
    }, 200),
    []
  )

  const debouncedUpdateRangeFilter = useMemo(
    () => debounce((filterKey, rangeKey, value) => {
      setFilters(prev => ({
        ...prev,
        [filterKey]: {
          ...prev[filterKey],
          [rangeKey]: value
        }
      }))
    }, 300),
    []
  )

  // Immediate filter management functions (for non-performance-critical updates)
  const updateFilter = useCallback((filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }, [])

  const updateArrayFilter = useCallback((filterKey, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: checked
        ? [...prev[filterKey], value]
        : prev[filterKey].filter(item => item !== value)
    }))
  }, [])

  const updateRangeFilter = useCallback((filterKey, rangeKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        [rangeKey]: value
      }
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(getInitialFilters())
  }, [])

  const applyPreset = useCallback((presetName) => {
    const preset = getFilterPreset(presetName)
    setFilters(prev => ({
      ...prev,
      ...preset
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setFilters({
      entityTypes: ['company', 'authority', 'jobSeeker', 'skill', 'position'],
      relationshipStrength: { min: 0, max: 100 },
      connectionTypes: ['employment', 'match', 'skill', 'requirement'],
      dateRange: { start: null, end: null },
      activityLevel: 'all',
      locations: [],
      remoteWork: 'all',
      skillCategories: [],
      skillLevels: [],
      companyIndustries: [],
      companySizes: [],
      matchScoreRange: { min: 0, max: 100 },
      matchStatus: 'all',
      experienceRange: { min: 0, max: 20 },
      seniorityLevels: []
    })
  }, [])

  // Get filter statistics
  const filterStats = useMemo(() => {
    const originalCount = enableNetworkFiltering && data?.nodes ? data.nodes.length : data?.length || 0
    const filteredCount = enableNetworkFiltering && filteredData?.nodes ? filteredData.nodes.length : filteredData?.length || 0

    return {
      originalCount,
      filteredCount,
      filteredPercentage: originalCount > 0 ? Math.round((filteredCount / originalCount) * 100) : 100,
      removedCount: originalCount - filteredCount,
      isFiltered: filteredCount < originalCount
    }
  }, [data, filteredData, enableNetworkFiltering])

  return {
    // Filter state
    filters,
    filteredData,
    isActive,

    // Filter management (immediate)
    updateFilter,
    updateArrayFilter,
    updateRangeFilter,
    clearAllFilters,
    applyPreset,
    resetToDefaults,

    // Filter management (debounced for performance)
    debouncedUpdateFilter,
    debouncedUpdateArrayFilter,
    debouncedUpdateRangeFilter,

    // Filter utilities
    filterSuggestions,
    filterValidation,
    filterStats,

    // Available presets
    availablePresets: [
      'high-quality-matches',
      'senior-positions',
      'tech-skills',
      'remote-opportunities',
      'startup-ecosystem',
      'enterprise-level'
    ]
  }
}

/**
 * Specialized hooks for different entity types
 */

export function useCompanyFilters(companies, options = {}) {
  return useAdvancedFilters(companies, 'company', options)
}

export function usePositionFilters(positions, options = {}) {
  return useAdvancedFilters(positions, 'position', options)
}

export function useJobSeekerFilters(jobSeekers, options = {}) {
  return useAdvancedFilters(jobSeekers, 'jobSeeker', options)
}

export function useSkillFilters(skills, options = {}) {
  return useAdvancedFilters(skills, 'skill', options)
}

export function useAuthorityFilters(authorities, options = {}) {
  return useAdvancedFilters(authorities, 'authority', options)
}

export function useMatchFilters(matches, options = {}) {
  return useAdvancedFilters(matches, 'match', options)
}

export function useNetworkFilters(networkData, options = {}) {
  return useAdvancedFilters(networkData, 'network', {
    ...options,
    enableNetworkFiltering: true
  })
}

export default useAdvancedFilters
