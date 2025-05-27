// Performance monitoring widget for development
// Provides a floating performance monitor that can be toggled on/off

import { useState, useEffect } from 'react'
import PerformanceDashboard from './PerformanceDashboard'
import { performanceMonitor } from '../../lib/performanceOptimizer'

export default function PerformanceMonitorWidget({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [quickStats, setQuickStats] = useState({})

  // Update quick stats periodically
  useEffect(() => {
    if (!enabled) return

    const updateStats = () => {
      const report = performanceMonitor.getPerformanceReport()
      setQuickStats({
        performanceScore: calculateQuickScore(report),
        memoryUsage: report.memory?.current?.usagePercent || 0,
        renderTime: report.render?.averageRenderTime || 0
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 3000)

    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isVisible && (
        <div className={`fixed ${positionClasses[position]} z-40 ${className}`}>
          <button
            onClick={() => setIsVisible(true)}
            className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              getStatusColor(quickStats.performanceScore)
            }`}
            title="Open Performance Monitor"
          >
            <div className="text-white text-xs font-bold">
              {Math.round(quickStats.performanceScore || 0)}
            </div>
            <div className="text-white text-xs">
              ⚡
            </div>
          </button>
        </div>
      )}

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        className={className}
      />

      {/* Quick Stats Overlay (when minimized) */}
      {isVisible && isMinimized && (
        <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Performance</h4>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Expand"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <QuickStatRow
                label="Score"
                value={Math.round(quickStats.performanceScore || 0)}
                unit="%"
                color={getScoreColor(quickStats.performanceScore)}
              />
              <QuickStatRow
                label="Memory"
                value={Math.round(quickStats.memoryUsage || 0)}
                unit="%"
                color={quickStats.memoryUsage > 80 ? 'red' : 'green'}
              />
              <QuickStatRow
                label="Render"
                value={Math.round(quickStats.renderTime || 0)}
                unit="ms"
                color={quickStats.renderTime > 16 ? 'red' : 'green'}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function QuickStatRow({ label, value, unit, color = 'gray' }) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${colorClasses[color]}`}>
        {value}{unit}
      </span>
    </div>
  )
}

function getStatusColor(score) {
  if (score >= 90) return 'bg-green-500 hover:bg-green-600'
  if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600'
  if (score >= 50) return 'bg-orange-500 hover:bg-orange-600'
  return 'bg-red-500 hover:bg-red-600'
}

function getScoreColor(score) {
  if (score >= 90) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}

function calculateQuickScore(performance) {
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
