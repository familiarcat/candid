// Performance optimization utilities for Candid Connections
// Provides caching, memoization, and data virtualization capabilities

/**
 * Simple in-memory cache with TTL support
 */
class MemoryCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
export const dataCache = new MemoryCache(10 * 60 * 1000) // 10 minutes for data
export const visualizationCache = new MemoryCache(5 * 60 * 1000) // 5 minutes for visualizations
export const filterCache = new MemoryCache(2 * 60 * 1000) // 2 minutes for filters

/**
 * Debounce function for expensive operations
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle function for high-frequency events
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Memoization with cache key generation
 */
export function memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return function memoized(...args) {
    const key = keyGenerator(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, result)
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

/**
 * Data virtualization for large lists
 */
export function virtualizeData(data, viewport, itemHeight = 100) {
  if (!data || data.length === 0) return { visibleItems: [], totalHeight: 0 }

  const { scrollTop = 0, containerHeight = 600 } = viewport
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    data.length
  )
  
  const visibleItems = data.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    index: startIndex + index,
    top: (startIndex + index) * itemHeight
  }))
  
  return {
    visibleItems,
    totalHeight: data.length * itemHeight,
    startIndex,
    endIndex
  }
}

/**
 * Optimize network data for visualization
 */
export function optimizeNetworkData(networkData, maxNodes = 500, maxLinks = 1000) {
  if (!networkData || !networkData.nodes) return networkData

  let { nodes, links } = networkData

  // If data is within limits, return as-is
  if (nodes.length <= maxNodes && links.length <= maxLinks) {
    return networkData
  }

  console.log(`🔧 Optimizing network data: ${nodes.length} nodes, ${links.length} links`)

  // Sort nodes by importance (size, connections, etc.)
  const nodeConnections = new Map()
  links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source
    const targetId = typeof link.target === 'object' ? link.target.id : link.target
    
    nodeConnections.set(sourceId, (nodeConnections.get(sourceId) || 0) + 1)
    nodeConnections.set(targetId, (nodeConnections.get(targetId) || 0) + 1)
  })

  // Keep most connected and important nodes
  const sortedNodes = nodes
    .map(node => ({
      ...node,
      connectionCount: nodeConnections.get(node.id) || 0,
      importance: (node.size || 5) + (nodeConnections.get(node.id) || 0) * 2
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxNodes)

  const keptNodeIds = new Set(sortedNodes.map(node => node.id))

  // Keep only links between remaining nodes
  const optimizedLinks = links
    .filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      return keptNodeIds.has(sourceId) && keptNodeIds.has(targetId)
    })
    .sort((a, b) => (b.strength || b.value || 1) - (a.strength || a.value || 1))
    .slice(0, maxLinks)

  console.log(`✅ Optimized to: ${sortedNodes.length} nodes, ${optimizedLinks.length} links`)

  return {
    ...networkData,
    nodes: sortedNodes,
    links: optimizedLinks,
    optimized: true,
    originalStats: {
      nodes: nodes.length,
      links: links.length
    }
  }
}

/**
 * Batch API requests to reduce network overhead
 */
export class BatchRequestManager {
  constructor(batchSize = 5, delay = 100) {
    this.batchSize = batchSize
    this.delay = delay
    this.queue = []
    this.processing = false
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject })
      this.processBatch()
    })
  }

  async processBatch() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)
      
      try {
        const promises = batch.map(({ url, options }) => 
          fetch(url, options).then(res => res.json())
        )
        
        const results = await Promise.all(promises)
        
        batch.forEach(({ resolve }, index) => {
          resolve(results[index])
        })
      } catch (error) {
        batch.forEach(({ reject }) => {
          reject(error)
        })
      }
      
      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay))
      }
    }
    
    this.processing = false
  }
}

/**
 * Optimize filtering operations
 */
export function optimizeFiltering(data, filters, chunkSize = 1000) {
  if (!data || data.length === 0) return data

  // For small datasets, use regular filtering
  if (data.length <= chunkSize) {
    return data.filter(item => applyFilters(item, filters))
  }

  // For large datasets, use chunked processing
  const results = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const filteredChunk = chunk.filter(item => applyFilters(item, filters))
    results.push(...filteredChunk)
  }

  return results
}

function applyFilters(item, filters) {
  // Simplified filter application - would use actual filter logic
  return true
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }

  start(operation) {
    this.metrics.set(operation, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    })
  }

  end(operation) {
    const metric = this.metrics.get(operation)
    if (!metric) return null

    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()

    const result = {
      operation,
      duration: endTime - metric.startTime,
      memoryDelta: endMemory - metric.startMemory,
      timestamp: new Date().toISOString()
    }

    this.metrics.delete(operation)
    return result
  }

  getMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      return window.performance.memory.usedJSHeapSize
    }
    return 0
  }

  logMetrics() {
    console.table(Array.from(this.metrics.entries()))
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Cleanup utilities for memory management
 */
export function cleanupCaches() {
  dataCache.cleanup()
  visualizationCache.cleanup()
  filterCache.cleanup()
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCaches, 5 * 60 * 1000)
}

export default {
  MemoryCache,
  dataCache,
  visualizationCache,
  filterCache,
  debounce,
  throttle,
  memoize,
  virtualizeData,
  optimizeNetworkData,
  BatchRequestManager,
  optimizeFiltering,
  PerformanceMonitor,
  performanceMonitor,
  cleanupCaches
}
