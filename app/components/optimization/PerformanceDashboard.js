// Performance monitoring dashboard for development and debugging
// Provides real-time performance metrics and optimization insights

import { useState, useEffect, useRef } from 'react'
import { performanceMonitor, smartCache } from '../../../lib/performanceOptimizer'
import { optimizedFetcher } from '../../../lib/dataOptimizer'

export default function PerformanceDashboard({ 
  isVisible = false, 
  onClose,
  className = '' 
}) {
  const [metrics, setMetrics] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [isMinimized, setIsMinimized] = useState(false)
  const updateInterval = useRef(null)

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible) return

    const updateMetrics = () => {
      const report = performanceMonitor.getPerformanceReport()
      const cacheStats = smartCache.getStats()
      const fetcherStats = optimizedFetcher.getStats()

      setMetrics({
        performance: report,
        cache: cacheStats,
        fetcher: fetcherStats,
        timestamp: Date.now()
      })
    }

    updateMetrics()
    updateInterval.current = setInterval(updateMetrics, 2000)

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'cache', label: 'Cache', icon: '💾' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'recommendations', label: 'Tips', icon: '💡' }
  ]

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-64 h-12' : 'w-96 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-gray-900">Performance Monitor</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isMinimized ? "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" : "M20 12H4"} />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-3 h-80 overflow-y-auto">
              {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
              {activeTab === 'performance' && <PerformanceTab metrics={metrics} />}
              {activeTab === 'cache' && <CacheTab metrics={metrics} />}
              {activeTab === 'network' && <NetworkTab metrics={metrics} />}
              {activeTab === 'recommendations' && <RecommendationsTab metrics={metrics} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ metrics }) {
  const { performance, cache, fetcher } = metrics

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Performance Score"
          value={calculatePerformanceScore(performance)}
          unit="%"
          color="green"
        />
        <MetricCard
          title="Cache Hit Rate"
          value={cache?.hitRate || 0}
          unit="%"
          color="blue"
        />
        <MetricCard
          title="Memory Usage"
          value={performance?.memory?.current?.usagePercent || 0}
          unit="%"
          color={performance?.memory?.current?.usagePercent > 80 ? "red" : "green"}
        />
        <MetricCard
          title="Active Requests"
          value={fetcher?.pendingRequests || 0}
          unit=""
          color="purple"
        />
      </div>

      <div className="text-xs text-gray-600">
        <p>Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

function PerformanceTab({ metrics }) {
  const { performance } = metrics

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Core Web Vitals</h4>
      
      <div className="space-y-2">
        <MetricRow
          label="LCP (Largest Contentful Paint)"
          value={performance?.metrics?.LCP?.latest}
          unit="ms"
          threshold={2500}
        />
        <MetricRow
          label="FID (First Input Delay)"
          value={performance?.metrics?.FID?.latest}
          unit="ms"
          threshold={100}
        />
        <MetricRow
          label="CLS (Cumulative Layout Shift)"
          value={performance?.metrics?.CLS?.latest}
          unit=""
          threshold={0.1}
        />
      </div>

      {performance?.render && (
        <>
          <h4 className="text-sm font-semibold text-gray-900 mt-4">Render Performance</h4>
          <div className="space-y-2">
            <MetricRow
              label="Average Render Time"
              value={performance.render.averageRenderTime}
              unit="ms"
              threshold={16}
            />
            <MetricRow
              label="Slow Renders"
              value={performance.render.slowRenders}
              unit=""
              threshold={5}
            />
          </div>
        </>
      )}
    </div>
  )
}

function CacheTab({ metrics }) {
  const { cache } = metrics

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Cache Statistics</h4>
      
      <div className="space-y-2">
        <MetricRow label="Cache Size" value={cache?.size} unit="entries" />
        <MetricRow label="Hit Rate" value={cache?.hitRate} unit="%" />
        <MetricRow label="Total Hits" value={cache?.hitCount} unit="" />
        <MetricRow label="Total Misses" value={cache?.missCount} unit="" />
        <MetricRow 
          label="Memory Usage" 
          value={cache?.memoryUsage ? Math.round(cache.memoryUsage / 1024) : 0} 
          unit="KB" 
        />
      </div>

      <div className="mt-4">
        <button
          onClick={() => smartCache.cache.clear()}
          className="w-full px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Clear Cache
        </button>
      </div>
    </div>
  )
}

function NetworkTab({ metrics }) {
  const { performance } = metrics

  const networkMetrics = performance?.metrics?.NetworkRequest

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Network Performance</h4>
      
      {networkMetrics ? (
        <div className="space-y-2">
          <MetricRow
            label="Average Request Time"
            value={Math.round(networkMetrics.average)}
            unit="ms"
            threshold={1000}
          />
          <MetricRow
            label="Total Requests"
            value={networkMetrics.count}
            unit=""
          />
          <MetricRow
            label="Fastest Request"
            value={Math.round(networkMetrics.min)}
            unit="ms"
          />
          <MetricRow
            label="Slowest Request"
            value={Math.round(networkMetrics.max)}
            unit="ms"
          />
        </div>
      ) : (
        <p className="text-xs text-gray-500">No network data available</p>
      )}
    </div>
  )
}

function RecommendationsTab({ metrics }) {
  const { performance } = metrics
  const recommendations = performance?.recommendations || []

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Optimization Tips</h4>
      
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-2 rounded-md text-xs ${
                rec.severity === 'high' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="font-medium text-gray-900">{rec.type}</div>
              <div className="text-gray-700 mt-1">{rec.message}</div>
              <div className="text-gray-600 mt-1 italic">{rec.action}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-xs text-gray-600">
            Great job! No performance issues detected.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, unit, color = 'gray' }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className={`p-2 rounded-md border ${colorClasses[color]}`}>
      <div className="text-xs font-medium">{title}</div>
      <div className="text-lg font-bold">
        {typeof value === 'number' ? value.toFixed(1) : value || '—'}
        <span className="text-xs font-normal ml-1">{unit}</span>
      </div>
    </div>
  )
}

function MetricRow({ label, value, unit, threshold }) {
  const isGood = threshold ? value < threshold : true
  
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${isGood ? 'text-green-600' : 'text-red-600'}`}>
        {typeof value === 'number' ? value.toFixed(1) : value || '—'} {unit}
      </span>
    </div>
  )
}

function calculatePerformanceScore(performance) {
  if (!performance?.metrics) return 0

  let score = 100
  const metrics = performance.metrics

  // LCP penalty
  if (metrics.LCP?.latest > 2500) score -= 20
  else if (metrics.LCP?.latest > 1200) score -= 10

  // FID penalty
  if (metrics.FID?.latest > 100) score -= 15
  else if (metrics.FID?.latest > 50) score -= 5

  // CLS penalty
  if (metrics.CLS?.latest > 0.25) score -= 15
  else if (metrics.CLS?.latest > 0.1) score -= 5

  // Memory penalty
  if (performance.memory?.current?.usagePercent > 80) score -= 20
  else if (performance.memory?.current?.usagePercent > 60) score -= 10

  return Math.max(0, score)
}
