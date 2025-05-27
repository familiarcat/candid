// Responsive visualization wrapper for mobile and desktop
// Automatically adapts visualization size and controls for different screen sizes

import { useState, useEffect, useRef } from 'react'
import { responsiveAnimator, mobileDetector } from '../../lib/mobileAnimations'
import { MobileTabs } from './MobileOptimizedComponents'

/**
 * Responsive container for visualizations
 */
export function ResponsiveVisualizationContainer({ 
  children, 
  className = '',
  minHeight = 400,
  maxHeight = 800 
}) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const breakpoint = responsiveAnimator.getCurrentBreakpoint()
      
      // Responsive sizing based on breakpoint
      const responsiveHeight = responsiveAnimator.getResponsiveValue({
        xs: Math.min(rect.width * 0.75, 300), // Mobile: 3:4 aspect ratio, max 300px
        sm: Math.min(rect.width * 0.6, 400),  // Small: 5:3 aspect ratio, max 400px
        md: Math.min(rect.width * 0.5, 500),  // Medium: 2:1 aspect ratio, max 500px
        lg: Math.min(rect.width * 0.4, 600),  // Large: 5:2 aspect ratio, max 600px
        xl: Math.min(rect.width * 0.35, 700), // XL: 3:1 aspect ratio, max 700px
        default: 600
      })

      const newDimensions = {
        width: Math.max(rect.width - 32, 300), // Account for padding, minimum 300px
        height: Math.max(Math.min(responsiveHeight, maxHeight), minHeight)
      }

      setDimensions(newDimensions)
    }

    updateDimensions()
    
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [minHeight, maxHeight])

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div
        className="w-full mx-auto"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`
        }}
      >
        {typeof children === 'function' ? children(dimensions) : children}
      </div>
    </div>
  )
}

/**
 * Mobile-optimized visualization controls
 */
export function MobileVisualizationControls({ 
  visualizationMode, 
  onModeChange,
  filters,
  onFiltersChange,
  additionalControls = [],
  className = '' 
}) {
  const [activeTab, setActiveTab] = useState('view')

  const tabs = [
    { id: 'view', label: 'View', icon: '👁️' },
    { id: 'filters', label: 'Filters', icon: '🔍' },
    ...(additionalControls.length > 0 ? [{ id: 'controls', label: 'Controls', icon: '⚙️' }] : [])
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Mobile tabs */}
      <div className="md:hidden">
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="p-4 pb-0"
        />
        
        <div className="p-4">
          {activeTab === 'view' && (
            <ViewControls 
              visualizationMode={visualizationMode}
              onModeChange={onModeChange}
            />
          )}
          
          {activeTab === 'filters' && (
            <FilterControls 
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          )}
          
          {activeTab === 'controls' && additionalControls.length > 0 && (
            <div className="space-y-4">
              {additionalControls}
            </div>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ViewControls 
            visualizationMode={visualizationMode}
            onModeChange={onModeChange}
          />
          
          <FilterControls 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
          
          {additionalControls.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Additional Controls</h4>
              {additionalControls}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ViewControls({ visualizationMode, onModeChange }) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Visualization Mode</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModeChange('2d')}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px] ${
            visualizationMode === '2d'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="text-lg mb-1">📊</div>
          2D Network
        </button>
        <button
          onClick={() => onModeChange('3d')}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px] ${
            visualizationMode === '3d'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="text-lg mb-1">🌐</div>
          3D Network
        </button>
      </div>
    </div>
  )
}

function FilterControls({ filters, onFiltersChange }) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Quick Filters</h4>
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters?.showMatches || false}
            onChange={(e) => onFiltersChange?.({ ...filters, showMatches: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show Matches</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters?.showSkills || false}
            onChange={(e) => onFiltersChange?.({ ...filters, showSkills: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show Skills</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters?.showCompanies || false}
            onChange={(e) => onFiltersChange?.({ ...filters, showCompanies: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Show Companies</span>
        </label>
      </div>
    </div>
  )
}

/**
 * Touch-friendly zoom and pan controls for mobile
 */
export function MobileVisualizationGestures({ 
  onZoomIn, 
  onZoomOut, 
  onReset,
  onPan,
  className = '' 
}) {
  const gestureRef = useRef(null)

  useEffect(() => {
    if (!gestureRef.current || !mobileDetector.isTouch) return

    let initialDistance = 0
    let initialScale = 1
    let isPinching = false

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinching = true
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
      }
    }

    const handleTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        
        const scale = currentDistance / initialDistance
        
        if (scale > 1.1) {
          onZoomIn?.()
          initialDistance = currentDistance
        } else if (scale < 0.9) {
          onZoomOut?.()
          initialDistance = currentDistance
        }
      }
    }

    const handleTouchEnd = () => {
      isPinching = false
    }

    const element = gestureRef.current
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onZoomIn, onZoomOut])

  return (
    <div ref={gestureRef} className={`relative ${className}`}>
      {/* Touch gesture overlay */}
      <div className="absolute inset-0 pointer-events-none" />
      
      {/* Mobile zoom controls */}
      {mobileDetector.isMobile && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button
            onClick={onZoomIn}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Zoom in"
          >
            <span className="text-xl">+</span>
          </button>
          <button
            onClick={onZoomOut}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Zoom out"
          >
            <span className="text-xl">−</span>
          </button>
          <button
            onClick={onReset}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Reset view"
          >
            <span className="text-sm">⌂</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default {
  ResponsiveVisualizationContainer,
  MobileVisualizationControls,
  MobileVisualizationGestures
}
