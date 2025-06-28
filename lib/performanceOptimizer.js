// Performance optimization system for Candid Connections
// Provides intelligent caching, lazy loading, and performance monitoring

import { mobileDetector } from './mobileAnimations'

/**
 * Performance Monitor - Track and optimize application performance
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Set()
    this.isMonitoring = false
    this.performanceEntries = []
    this.memoryUsage = []
    this.renderTimes = []
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.isMonitoring = true

    // Monitor Core Web Vitals
    this.observeWebVitals()

    // Monitor memory usage
    this.observeMemoryUsage()

    // Monitor render performance
    this.observeRenderPerformance()

    // Monitor network performance
    this.observeNetworkPerformance()

    console.log('🚀 Performance monitoring started')
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    console.log('⏹️ Performance monitoring stopped')
  }

  /**
   * Observe Core Web Vitals (LCP, FID, CLS)
   */
  observeWebVitals() {
    if (!window.PerformanceObserver) return

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric('LCP', lastEntry.startTime, 'ms')
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.add(lcpObserver)

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms')
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.add(fidObserver)

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      let clsValue = 0
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric('CLS', clsValue, 'score')
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.add(clsObserver)
  }

  /**
   * Monitor memory usage
   */
  observeMemoryUsage() {
    if (!performance.memory) return

    const checkMemory = () => {
      if (!this.isMonitoring) return

      const memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      }

      this.memoryUsage.push(memory)
      
      // Keep only last 100 entries
      if (this.memoryUsage.length > 100) {
        this.memoryUsage = this.memoryUsage.slice(-50)
      }

      // Check for memory leaks
      if (memory.used > memory.limit * 0.8) {
        console.warn('⚠️ High memory usage detected:', memory)
      }

      setTimeout(checkMemory, 5000) // Check every 5 seconds
    }

    checkMemory()
  }

  /**
   * Monitor render performance
   */
  observeRenderPerformance() {
    if (!window.PerformanceObserver) return

    const renderObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          this.renderTimes.push({
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime
          })

          // Keep only last 50 render times
          if (this.renderTimes.length > 50) {
            this.renderTimes = this.renderTimes.slice(-25)
          }
        }
      })
    })
    renderObserver.observe({ entryTypes: ['measure'] })
    this.observers.add(renderObserver)
  }

  /**
   * Monitor network performance
   */
  observeNetworkPerformance() {
    if (!window.PerformanceObserver) return

    const networkObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
          this.recordMetric('NetworkRequest', entry.duration, 'ms', {
            url: entry.name,
            size: entry.transferSize,
            type: entry.initiatorType
          })
        }
      })
    })
    networkObserver.observe({ entryTypes: ['resource'] })
    this.observers.add(networkObserver)
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value, unit, metadata = {}) {
    const metric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name).push(metric)

    // Keep only last 100 entries per metric
    const entries = this.metrics.get(name)
    if (entries.length > 100) {
      this.metrics.set(name, entries.slice(-50))
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      memory: this.getMemoryReport(),
      render: this.getRenderReport(),
      recommendations: [] // Initialize to be populated later
    }

    // Aggregate metrics
    for (const [name, entries] of this.metrics) {
      const values = entries.map(e => e.value)
      // Prevent errors on empty metric arrays
      if (values.length > 0) {
        report.metrics[name] = {
          count: values.length,
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
          unit: entries[0]?.unit || 'unknown'
        }
      }
    }

    // Generate recommendations based on the fully built report
    report.recommendations = this.getRecommendations(report)

    return report
  }

  /**
   * Get memory usage report
   */
  getMemoryReport() {
    if (this.memoryUsage.length === 0) return null

    const latest = this.memoryUsage[this.memoryUsage.length - 1]
    const usagePercent = (latest.used / latest.total) * 100

    return {
      current: {
        used: this.formatBytes(latest.used),
        total: this.formatBytes(latest.total),
        usagePercent: Math.round(usagePercent)
      },
      trend: this.getMemoryTrend(),
      isHealthy: usagePercent < 80
    }
  }

  /**
   * Get render performance report
   */
  getRenderReport() {
    if (this.renderTimes.length === 0) return null

    const durations = this.renderTimes.map(r => r.duration)
    const avgRenderTime = durations.reduce((a, b) => a + b, 0) / durations.length

    return {
      averageRenderTime: Math.round(avgRenderTime),
      slowRenders: this.renderTimes.filter(r => r.duration > 16).length, // > 16ms = < 60fps
      totalRenders: this.renderTimes.length,
      isSmooth: avgRenderTime < 16
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(report) {
    const recommendations = []

    // LCP recommendations
    if (report.metrics.LCP?.latest > 2500) {
      recommendations.push({
        type: 'LCP',
        severity: 'high',
        message: 'Largest Contentful Paint is slow. Consider optimizing images and critical resources.',
        action: 'Optimize images, use CDN, implement lazy loading'
      })
    }

    // FID recommendations
    if (report.metrics.FID?.latest > 100) {
      recommendations.push({
        type: 'FID',
        severity: 'medium',
        message: 'First Input Delay is high. Consider reducing JavaScript execution time.',
        action: 'Code splitting, defer non-critical JS, optimize event handlers'
      })
    }

    // Memory recommendations
    const memoryReport = this.getMemoryReport()
    if (memoryReport && memoryReport.current.usagePercent > 80) {
      recommendations.push({
        type: 'Memory',
        severity: 'high',
        message: 'High memory usage detected. Check for memory leaks.',
        action: 'Review component cleanup, optimize data structures, implement pagination'
      })
    }

    // Render recommendations
    const renderReport = this.getRenderReport()
    if (renderReport && !renderReport.isSmooth) {
      recommendations.push({
        type: 'Render',
        severity: 'medium',
        message: 'Render performance is below 60fps. Optimize animations and DOM updates.',
        action: 'Use CSS transforms, implement virtualization, reduce DOM complexity'
      })
    }

    return recommendations
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend() {
    if (this.memoryUsage.length < 2) return 'stable'

    const recent = this.memoryUsage.slice(-5)
    const trend = recent[recent.length - 1].used - recent[0].used

    if (trend > 1024 * 1024) return 'increasing' // > 1MB increase
    if (trend < -1024 * 1024) return 'decreasing' // > 1MB decrease
    return 'stable'
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

/**
 * Smart Cache System with intelligent invalidation
 */
export class SmartCache {
  constructor(options = {}) {
    this.cache = new Map()
    this.metadata = new Map()
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000 // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60 * 1000 // 1 minute
    this.hitCount = 0
    this.missCount = 0
    
    this.startCleanup()
  }

  /**
   * Set cache entry with intelligent metadata
   */
  set(key, value, options = {}) {
    const ttl = options.ttl || this.defaultTTL
    const priority = options.priority || 'normal' // low, normal, high
    const tags = options.tags || []
    
    const entry = {
      value,
      timestamp: Date.now(),
      ttl,
      priority,
      tags,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, entry)
    this.metadata.set(key, entry)
  }

  /**
   * Get cache entry with access tracking
   */
  get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.missCount++
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      this.missCount++
      return null
    }

    // Update access metadata
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.hitCount++

    return entry.value
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key)
    this.metadata.delete(key)
  }

  /**
   * Clear cache by tags
   */
  clearByTags(tags) {
    const keysToDelete = []
    
    for (const [key, entry] of this.metadata) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
    return keysToDelete.length
  }

  /**
   * Check if entry is expired
   */
  isExpired(entry) {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Evict least recently used entry
   */
  evictLeastUsed() {
    let lruKey = null
    let lruTime = Date.now()

    for (const [key, entry] of this.metadata) {
      if (entry.priority === 'high') continue // Never evict high priority
      
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.delete(lruKey)
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    if (typeof window === 'undefined') return

    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const keysToDelete = []
    
    for (const [key, entry] of this.metadata) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Estimate memory usage
   */
  estimateMemoryUsage() {
    let size = 0
    for (const [key, entry] of this.cache) {
      size += JSON.stringify(key).length
      size += JSON.stringify(entry.value).length
    }
    return size
  }
}

// Global instances
export const performanceMonitor = new PerformanceMonitor()
export const smartCache = new SmartCache({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 2 * 60 * 1000 // 2 minutes
})

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring()
}

export default {
  PerformanceMonitor,
  SmartCache,
  performanceMonitor,
  smartCache
}
