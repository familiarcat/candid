// Data fetching optimization with intelligent caching and batching
// Provides optimized data loading strategies for Candid Connections

import { useState, useEffect, useCallback, useRef } from 'react'
import { smartCache, performanceMonitor } from './performanceOptimizer'
import { mobileDetector } from './mobileAnimations'

/**
 * Optimized Data Fetcher with intelligent caching and batching
 */
export class OptimizedDataFetcher {
  constructor() {
    this.pendingRequests = new Map()
    this.batchQueue = new Map()
    this.batchTimeout = null
    this.batchDelay = mobileDetector.isMobile ? 100 : 50 // Longer delay on mobile
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  /**
   * Fetch data with intelligent caching
   */
  async fetch(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options)
    const cached = smartCache.get(cacheKey)

    if (cached && !options.forceRefresh) {
      performanceMonitor.recordMetric('CacheHit', 1, 'count')
      return cached
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)
    }

    // Create new request
    const requestPromise = this.executeRequest(url, options)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful result
      smartCache.set(cacheKey, result, {
        ttl: options.cacheTTL || 5 * 60 * 1000, // 5 minutes default
        priority: options.cachePriority || 'normal',
        tags: options.cacheTags || [this.extractEntityType(url)]
      })

      performanceMonitor.recordMetric('CacheMiss', 1, 'count')
      return result

    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Batch multiple requests for efficiency
   */
  async batchFetch(requests) {
    const batchId = Date.now().toString()

    // Add requests to batch queue
    requests.forEach((request, index) => {
      const requestId = `${batchId}-${index}`
      this.batchQueue.set(requestId, {
        ...request,
        resolve: null,
        reject: null,
        promise: null
      })
    })

    // Create promises for each request
    const promises = requests.map((request, index) => {
      const requestId = `${batchId}-${index}`
      const queuedRequest = this.batchQueue.get(requestId)

      queuedRequest.promise = new Promise((resolve, reject) => {
        queuedRequest.resolve = resolve
        queuedRequest.reject = reject
      })

      return queuedRequest.promise
    })

    // Schedule batch execution
    this.scheduleBatchExecution()

    return Promise.all(promises)
  }

  /**
   * Prefetch data for anticipated needs
   */
  async prefetch(urls, options = {}) {
    const prefetchPromises = urls.map(url => {
      const cacheKey = this.generateCacheKey(url, options)

      // Skip if already cached
      if (smartCache.get(cacheKey)) {
        return Promise.resolve()
      }

      // Prefetch with low priority
      return this.fetch(url, {
        ...options,
        cachePriority: 'low',
        cacheTTL: 15 * 60 * 1000 // 15 minutes for prefetched data
      }).catch(error => {
        console.warn('Prefetch failed:', url, error)
      })
    })

    return Promise.allSettled(prefetchPromises)
  }

  /**
   * Execute HTTP request with retry logic
   */
  async executeRequest(url, options = {}) {
    const startTime = performance.now()
    let lastError = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const duration = performance.now() - startTime

        performanceMonitor.recordMetric('RequestDuration', duration, 'ms', {
          url,
          attempt,
          status: response.status
        })

        return data

      } catch (error) {
        lastError = error

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          await this.sleep(delay)
          console.warn(`Request failed, retrying (${attempt}/${this.retryAttempts}):`, url, error)
        }
      }
    }

    performanceMonitor.recordMetric('RequestFailure', 1, 'count', { url, error: lastError.message })
    throw lastError
  }

  /**
   * Schedule batch execution
   */
  scheduleBatchExecution() {
    if (this.batchTimeout) return

    this.batchTimeout = setTimeout(() => {
      this.executeBatch()
      this.batchTimeout = null
    }, this.batchDelay)
  }

  /**
   * Execute batched requests
   */
  async executeBatch() {
    if (this.batchQueue.size === 0) return

    const requests = Array.from(this.batchQueue.values())
    this.batchQueue.clear()

    // Group requests by domain/endpoint for optimal batching
    const groupedRequests = this.groupRequestsByEndpoint(requests)

    for (const [endpoint, endpointRequests] of groupedRequests) {
      try {
        // Execute requests for this endpoint
        const results = await this.executeBatchForEndpoint(endpoint, endpointRequests)

        // Resolve individual promises
        endpointRequests.forEach((request, index) => {
          request.resolve(results[index])
        })

      } catch (error) {
        // Reject all requests for this endpoint
        endpointRequests.forEach(request => {
          request.reject(error)
        })
      }
    }
  }

  /**
   * Group requests by endpoint for batching
   */
  groupRequestsByEndpoint(requests) {
    const groups = new Map()

    requests.forEach(request => {
      const endpoint = this.extractEndpoint(request.url)

      if (!groups.has(endpoint)) {
        groups.set(endpoint, [])
      }

      groups.get(endpoint).push(request)
    })

    return groups
  }

  /**
   * Execute batch requests for a specific endpoint
   */
  async executeBatchForEndpoint(endpoint, requests) {
    // For now, execute requests individually
    // In a real implementation, this would use a batch API endpoint
    const results = await Promise.all(
      requests.map(request => this.executeRequest(request.url, request.options))
    )

    return results
  }

  /**
   * Generate cache key from URL and options
   */
  generateCacheKey(url, options = {}) {
    const keyData = {
      url,
      method: options.method || 'GET',
      body: options.body,
      params: options.params
    }

    return btoa(JSON.stringify(keyData))
  }

  /**
   * Extract entity type from URL for cache tagging
   */
  extractEntityType(url) {
    const patterns = {
      'job-seekers': 'jobSeeker',
      'hiring-authorities': 'authority',
      'companies': 'company',
      'positions': 'position',
      'skills': 'skill',
      'matches': 'match'
    }

    for (const [pattern, type] of Object.entries(patterns)) {
      if (url.includes(pattern)) {
        return type
      }
    }

    return 'unknown'
  }

  /**
   * Extract endpoint from URL
   */
  extractEndpoint(url) {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.split('/')[1] || 'root'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear cache for specific entity types
   */
  invalidateCache(entityTypes = []) {
    if (entityTypes.length === 0) {
      // Clear all cache
      smartCache.cache.clear()
      smartCache.metadata.clear()
    } else {
      // Clear specific entity types
      smartCache.clearByTags(entityTypes)
    }
  }

  /**
   * Get fetcher statistics
   */
  getStats() {
    return {
      cache: smartCache.getStats(),
      pendingRequests: this.pendingRequests.size,
      batchQueueSize: this.batchQueue.size,
      performance: performanceMonitor.getPerformanceReport()
    }
  }
}

/**
 * React Hook for optimized data fetching
 */
export function useOptimizedFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetcher = useRef(new OptimizedDataFetcher()).current

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher.fetch(url, {
        ...options,
        forceRefresh
      })

      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [url, options, fetcher])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Prefetch related data
  const prefetch = useCallback((urls) => {
    return fetcher.prefetch(urls, options)
  }, [fetcher, options])

  return {
    data,
    loading,
    error,
    refresh,
    prefetch,
    lastFetch,
    stats: fetcher.getStats()
  }
}

/**
 * Pagination optimizer for large datasets
 */
export class PaginationOptimizer {
  constructor(options = {}) {
    this.pageSize = options.pageSize || 20
    this.prefetchPages = options.prefetchPages || 2
    this.cache = new Map()
    this.fetcher = new OptimizedDataFetcher()
  }

  /**
   * Fetch page with intelligent prefetching
   */
  async fetchPage(url, page = 1, options = {}) {
    const pageUrl = this.buildPageUrl(url, page, options)
    const cacheKey = `page-${page}-${this.generateCacheKey(url, options)}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && !options.forceRefresh) {
      this.prefetchAdjacentPages(url, page, options)
      return cached
    }

    // Fetch current page
    const data = await this.fetcher.fetch(pageUrl, options)
    this.cache.set(cacheKey, data)

    // Prefetch adjacent pages
    this.prefetchAdjacentPages(url, page, options)

    return data
  }

  /**
   * Prefetch adjacent pages for smooth navigation
   */
  async prefetchAdjacentPages(url, currentPage, options = {}) {
    const pagesToPrefetch = []

    // Prefetch next pages
    for (let i = 1; i <= this.prefetchPages; i++) {
      const nextPage = currentPage + i
      const nextPageUrl = this.buildPageUrl(url, nextPage, options)
      pagesToPrefetch.push(nextPageUrl)
    }

    // Prefetch previous pages
    for (let i = 1; i <= this.prefetchPages; i++) {
      const prevPage = currentPage - i
      if (prevPage > 0) {
        const prevPageUrl = this.buildPageUrl(url, prevPage, options)
        pagesToPrefetch.push(prevPageUrl)
      }
    }

    // Execute prefetch
    this.fetcher.prefetch(pagesToPrefetch, {
      ...options,
      cachePriority: 'low'
    })
  }

  /**
   * Build paginated URL
   */
  buildPageUrl(baseUrl, page, options = {}) {
    const url = new URL(baseUrl)
    url.searchParams.set('page', page)
    url.searchParams.set('limit', options.pageSize || this.pageSize)

    // Add other query parameters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    return url.toString()
  }

  /**
   * Generate cache key
   */
  generateCacheKey(url, options = {}) {
    return btoa(JSON.stringify({ url, filters: options.filters }))
  }
}

// Global optimized fetcher instance
export const optimizedFetcher = new OptimizedDataFetcher()
export const paginationOptimizer = new PaginationOptimizer()

export default {
  OptimizedDataFetcher,
  PaginationOptimizer,
  useOptimizedFetch,
  optimizedFetcher,
  paginationOptimizer
}
