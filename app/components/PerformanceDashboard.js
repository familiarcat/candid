// Performance monitoring dashboard component
// Displays real-time performance metrics and cache statistics

import { useState, useEffect } from 'react'
import { 
  dataCache, 
  visualizationCache, 
  filterCache, 
  performanceMonitor 
} from '../lib/performanceOptimizations'

export default function PerformanceDashboard({ className = '' }) {
  const [metrics, setMetrics] = useState({
    cacheStats: {
      data: { size: 0, hits: 0, misses: 0 },
      visualization: { size: 0, hits: 0, misses: 0 },
      filter: { size: 0, hits: 0, misses: 0 }
    },
    memoryUsage: 0,
    performanceMetrics: []
  })
  const [isVisible, setIsVisible] = useState(false)

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = {
        cacheStats: {
          data: {
            size: dataCache.size(),
            hits: dataCache.hits || 0,
            misses: dataCache.misses || 0
          },
          visualization: {
            size: visualizationCache.size(),
            hits: visualizationCache.hits || 0,
            misses: visualizationCache.misses || 0
          },
          filter: {
            size: filterCache.size(),
            hits: filterCache.hits || 0,
            misses: filterCache.misses || 0
          }
        },
        memoryUsage: performanceMonitor.getMemoryUsage(),
        performanceMetrics: Array.from(performanceMonitor.metrics.entries()).slice(-10)
      }
      setMetrics(newMetrics)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getCacheHitRate = (cache) => {
    const total = cache.hits + cache.misses
    return total > 0 ? Math.round((cache.hits / total) * 100) : 0
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors ${className}`}
      >
        📊 Performance
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Cache Statistics */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Cache Statistics</h4>
        <div className="space-y-2">
          {/* Data Cache */}
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">Data Cache</span>
              <span className="text-xs text-blue-600">{getCacheHitRate(metrics.cacheStats.data)}% hit rate</span>
            </div>
            <div className="text-xs text-blue-600">
              {metrics.cacheStats.data.size} items • {metrics.cacheStats.data.hits} hits • {metrics.cacheStats.data.misses} misses
            </div>
          </div>

          {/* Visualization Cache */}
          <div className="bg-green-50 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">Visualization Cache</span>
              <span className="text-xs text-green-600">{getCacheHitRate(metrics.cacheStats.visualization)}% hit rate</span>
            </div>
            <div className="text-xs text-green-600">
              {metrics.cacheStats.visualization.size} items • {metrics.cacheStats.visualization.hits} hits • {metrics.cacheStats.visualization.misses} misses
            </div>
          </div>

          {/* Filter Cache */}
          <div className="bg-purple-50 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800">Filter Cache</span>
              <span className="text-xs text-purple-600">{getCacheHitRate(metrics.cacheStats.filter)}% hit rate</span>
            </div>
            <div className="text-xs text-purple-600">
              {metrics.cacheStats.filter.size} items • {metrics.cacheStats.filter.hits} hits • {metrics.cacheStats.filter.misses} misses
            </div>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      {metrics.memoryUsage > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Memory Usage</h4>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-sm text-gray-800">{formatBytes(metrics.memoryUsage)}</div>
            <div className="text-xs text-gray-600">JavaScript Heap Size</div>
          </div>
        </div>
      )}

      {/* Recent Performance Metrics */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Operations</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {metrics.performanceMetrics.length > 0 ? (
            metrics.performanceMetrics.map(([operation, metric], index) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 truncate">{operation}</span>
                  <span className="text-gray-600">{formatDuration(metric.duration)}</span>
                </div>
                {metric.memoryDelta > 0 && (
                  <div className="text-gray-500">
                    Memory: +{formatBytes(metric.memoryDelta)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">
              No recent operations
            </div>
          )}
        </div>
      </div>

      {/* Cache Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            dataCache.clear()
            visualizationCache.clear()
            filterCache.clear()
            setMetrics(prev => ({
              ...prev,
              cacheStats: {
                data: { size: 0, hits: 0, misses: 0 },
                visualization: { size: 0, hits: 0, misses: 0 },
                filter: { size: 0, hits: 0, misses: 0 }
              }
            }))
          }}
          className="flex-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
        >
          Clear Caches
        </button>
        <button
          onClick={() => {
            dataCache.cleanup()
            visualizationCache.cleanup()
            filterCache.cleanup()
          }}
          className="flex-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
        >
          Cleanup
        </button>
      </div>

      {/* Performance Tips */}
      <div className="mt-4 p-2 bg-yellow-50 rounded">
        <div className="text-xs text-yellow-800 font-medium mb-1">💡 Performance Tips</div>
        <div className="text-xs text-yellow-700">
          • High cache hit rates indicate good performance
          • Clear caches if memory usage is high
          • Cleanup removes expired cache entries
        </div>
      </div>
    </div>
  )
}
