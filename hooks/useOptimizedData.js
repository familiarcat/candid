// Optimized data loading hook with caching and performance enhancements
// Provides efficient data fetching with memory management and caching

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  dataCache, 
  BatchRequestManager, 
  performanceMonitor,
  debounce,
  memoize
} from '../lib/performanceOptimizations'

// Global batch request manager
const batchManager = new BatchRequestManager(3, 50) // 3 requests per batch, 50ms delay

/**
 * Optimized data loading hook with caching and performance monitoring
 */
export function useOptimizedData(entityType, options = {}) {
  const {
    enableCaching = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    enableBatching = true,
    enablePerformanceMonitoring = false
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Generate cache key
  const cacheKey = useMemo(() => `${entityType}-data`, [entityType])

  // Optimized fetch function with caching
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (enableCaching && !forceRefresh) {
      const cachedData = dataCache.get(cacheKey)
      if (cachedData) {
        console.log(`📦 Using cached data for ${entityType}`)
        setData(cachedData)
        setLastUpdated(new Date())
        return cachedData
      }
    }

    setLoading(true)
    setError(null)

    try {
      if (enablePerformanceMonitoring) {
        performanceMonitor.start(`fetch-${entityType}`)
      }

      const url = `/api/${entityType}`
      let response

      if (enableBatching) {
        response = await batchManager.request(url)
      } else {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch ${entityType}`)
        response = await res.json()
      }

      // Cache the response
      if (enableCaching) {
        dataCache.set(cacheKey, response, cacheTTL)
      }

      setData(response)
      setLastUpdated(new Date())

      if (enablePerformanceMonitoring) {
        const metrics = performanceMonitor.end(`fetch-${entityType}`)
        console.log(`⚡ ${entityType} fetch metrics:`, metrics)
      }

      return response

    } catch (err) {
      console.error(`❌ Error fetching ${entityType}:`, err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [entityType, cacheKey, enableCaching, cacheTTL, enableBatching, enablePerformanceMonitoring])

  // Debounced refresh function
  const debouncedRefresh = useMemo(
    () => debounce(() => fetchData(true), 300),
    [fetchData]
  )

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Clear cache for this entity
  const clearCache = useCallback(() => {
    dataCache.cache.delete(cacheKey)
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    debouncedRefresh,
    clearCache,
    cacheKey
  }
}

/**
 * Optimized hook for loading all entities with intelligent caching
 */
export function useOptimizedAllData(options = {}) {
  const {
    enableCaching = true,
    enableBatching = true,
    enablePerformanceMonitoring = false,
    staleTime = 2 * 60 * 1000 // 2 minutes
  } = options

  const [allData, setAllData] = useState({
    companies: [],
    hiringAuthorities: [],
    jobSeekers: [],
    skills: [],
    positions: [],
    matches: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [lastUpdated, setLastUpdated] = useState({})

  // Memoized fetch function for all entities
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    const entities = ['companies', 'hiring-authorities', 'job-seekers', 'skills', 'positions', 'matches']
    const stateKeys = ['companies', 'hiringAuthorities', 'jobSeekers', 'skills', 'positions', 'matches']
    
    setLoading(true)
    const newErrors = {}
    const newData = { ...allData }
    const newLastUpdated = { ...lastUpdated }

    if (enablePerformanceMonitoring) {
      performanceMonitor.start('fetch-all-data')
    }

    try {
      // Check cache for each entity
      const fetchPromises = entities.map(async (entity, index) => {
        const stateKey = stateKeys[index]
        const cacheKey = `${entity}-data`

        // Check cache first
        if (enableCaching && !forceRefresh) {
          const cachedData = dataCache.get(cacheKey)
          const cacheAge = Date.now() - (dataCache.cache.get(cacheKey)?.expiry - dataCache.defaultTTL || 0)
          
          if (cachedData && cacheAge < staleTime) {
            console.log(`📦 Using fresh cached data for ${entity}`)
            return { entity, stateKey, data: cachedData, fromCache: true }
          }
        }

        // Fetch fresh data
        try {
          const url = `/api/${entity}`
          let response

          if (enableBatching) {
            response = await batchManager.request(url)
          } else {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`Failed to fetch ${entity}`)
            response = await res.json()
          }

          // Cache the response
          if (enableCaching) {
            dataCache.set(cacheKey, response)
          }

          return { entity, stateKey, data: response, fromCache: false }

        } catch (error) {
          console.error(`❌ Error fetching ${entity}:`, error)
          newErrors[stateKey] = error.message
          return { entity, stateKey, data: [], error: error.message }
        }
      })

      const results = await Promise.all(fetchPromises)

      // Process results
      results.forEach(({ stateKey, data, fromCache, error }) => {
        if (!error) {
          newData[stateKey] = data
          newLastUpdated[stateKey] = new Date()
          if (!fromCache) {
            console.log(`✅ Fetched fresh data for ${stateKey}: ${data.length} items`)
          }
        }
      })

      setAllData(newData)
      setLastUpdated(newLastUpdated)
      setErrors(newErrors)

      if (enablePerformanceMonitoring) {
        const metrics = performanceMonitor.end('fetch-all-data')
        console.log('⚡ All data fetch metrics:', metrics)
      }

    } catch (error) {
      console.error('❌ Error in fetchAllData:', error)
      setErrors({ global: error.message })
    } finally {
      setLoading(false)
    }

    return newData
  }, [allData, lastUpdated, enableCaching, enableBatching, enablePerformanceMonitoring, staleTime])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, []) // Only run once on mount

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchAllData(true)
  }, [fetchAllData])

  // Refresh specific entity
  const refreshEntity = useCallback(async (entityType) => {
    const entityMap = {
      'companies': 'companies',
      'hiring-authorities': 'hiringAuthorities',
      'job-seekers': 'jobSeekers',
      'skills': 'skills',
      'positions': 'positions',
      'matches': 'matches'
    }

    const stateKey = entityMap[entityType]
    if (!stateKey) return

    try {
      const url = `/api/${entityType}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch ${entityType}`)
      const data = await res.json()

      // Update cache
      if (enableCaching) {
        dataCache.set(`${entityType}-data`, data)
      }

      // Update state
      setAllData(prev => ({
        ...prev,
        [stateKey]: data
      }))
      setLastUpdated(prev => ({
        ...prev,
        [stateKey]: new Date()
      }))

      console.log(`✅ Refreshed ${entityType}: ${data.length} items`)
      return data

    } catch (error) {
      console.error(`❌ Error refreshing ${entityType}:`, error)
      setErrors(prev => ({
        ...prev,
        [stateKey]: error.message
      }))
    }
  }, [enableCaching])

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    const entities = ['companies', 'hiring-authorities', 'job-seekers', 'skills', 'positions', 'matches']
    entities.forEach(entity => {
      dataCache.cache.delete(`${entity}-data`)
    })
  }, [])

  // Computed values
  const isLoading = loading
  const hasErrors = Object.keys(errors).length > 0
  const totalItems = Object.values(allData).reduce((sum, arr) => sum + (arr?.length || 0), 0)

  return {
    // Data
    ...allData,
    
    // State
    loading: isLoading,
    errors,
    lastUpdated,
    
    // Actions
    refresh,
    refreshEntity,
    clearAllCaches,
    
    // Computed
    hasErrors,
    totalItems,
    
    // Cache info
    cacheStatus: {
      companies: dataCache.has('companies-data'),
      hiringAuthorities: dataCache.has('hiring-authorities-data'),
      jobSeekers: dataCache.has('job-seekers-data'),
      skills: dataCache.has('skills-data'),
      positions: dataCache.has('positions-data'),
      matches: dataCache.has('matches-data')
    }
  }
}

/**
 * Specialized hooks for individual entities
 */
export const useOptimizedCompanies = (options) => useOptimizedData('companies', options)
export const useOptimizedPositions = (options) => useOptimizedData('positions', options)
export const useOptimizedSkills = (options) => useOptimizedData('skills', options)
export const useOptimizedJobSeekers = (options) => useOptimizedData('job-seekers', options)
export const useOptimizedAuthorities = (options) => useOptimizedData('hiring-authorities', options)
export const useOptimizedMatches = (options) => useOptimizedData('matches', options)

export default {
  useOptimizedData,
  useOptimizedAllData,
  useOptimizedCompanies,
  useOptimizedPositions,
  useOptimizedSkills,
  useOptimizedJobSeekers,
  useOptimizedAuthorities,
  useOptimizedMatches
}
