// Professional loading animations for Candid Connections
// Provides various loading states with smooth animations

import { useState, useEffect } from 'react'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'

/**
 * Network visualization loading animation
 */
export function NetworkLoadingAnimation({ className = '', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Central node */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full animate-pulse"></div>
        
        {/* Orbiting nodes */}
        <div className="absolute inset-0 animate-spin">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        
        {/* Connection lines */}
        <div className="absolute inset-0 animate-pulse opacity-30">
          <svg className="w-full h-full">
            <line x1="50%" y1="50%" x2="50%" y2="0%" stroke="#6366f1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="#6366f1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="50%" y2="100%" stroke="#6366f1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="0%" y2="50%" stroke="#6366f1" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/**
 * Data processing loading animation
 */
export function DataLoadingAnimation({ className = '', message = 'Loading data...' }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Animated bars */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-2 bg-indigo-600 rounded-full animate-pulse"
            style={{
              height: '24px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
      
      {/* Loading message */}
      <div className="text-gray-600 text-sm font-medium">
        {message}{dots}
      </div>
    </div>
  )
}

/**
 * Visualization rendering loading animation
 */
export function VisualizationLoadingAnimation({ className = '', type = '2D' }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* 3D cube or 2D circle based on type */}
      {type === '3D' ? (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-lg animate-spin transform-gpu perspective-1000 rotate-x-45 rotate-y-45"></div>
        </div>
      ) : (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-blue-200 border-r-blue-500 rounded-full animate-spin animation-reverse"></div>
        </div>
      )}
      
      {/* Status text */}
      <div className="text-center">
        <div className="text-gray-900 font-medium">Rendering {type} Visualization</div>
        <div className="text-gray-500 text-sm">Optimizing network layout...</div>
      </div>
    </div>
  )
}

/**
 * Filter processing animation
 */
export function FilterLoadingAnimation({ className = '', activeFilters = 0 }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Animated filter icon */}
      <div className="relative">
        <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded animate-spin"></div>
      </div>
      
      {/* Status text */}
      <div className="text-sm text-gray-600">
        Applying {activeFilters} filter{activeFilters !== 1 ? 's' : ''}...
      </div>
    </div>
  )
}

/**
 * Skeleton loading for cards
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Content lines */}
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Progressive loading animation
 */
export function ProgressiveLoadingAnimation({ 
  className = '', 
  progress = 0, 
  stages = ['Connecting...', 'Loading data...', 'Rendering...', 'Complete!'] 
}) {
  const currentStage = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1)
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Current stage */}
      <div className="text-center">
        <div className="text-gray-900 font-medium">{stages[currentStage]}</div>
        <div className="text-gray-500 text-sm">{Math.round(progress)}% complete</div>
      </div>
      
      {/* Stage indicators */}
      <div className="flex justify-between">
        {stages.map((stage, index) => (
          <div 
            key={index}
            className={`flex items-center space-x-2 ${
              index <= currentStage ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${
              index <= currentStage ? 'bg-indigo-600' : 'bg-gray-300'
            }`}></div>
            <span className="text-xs hidden sm:block">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Animated loading overlay
 */
export function LoadingOverlay({ 
  isVisible = false, 
  children, 
  className = '',
  type = 'network',
  message = 'Loading...'
}) {
  if (!isVisible) return children

  const renderLoadingAnimation = () => {
    switch (type) {
      case 'network':
        return <NetworkLoadingAnimation />
      case 'data':
        return <DataLoadingAnimation message={message} />
      case 'visualization':
        return <VisualizationLoadingAnimation />
      case 'filter':
        return <FilterLoadingAnimation />
      default:
        return <NetworkLoadingAnimation />
    }
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-lg">
        {renderLoadingAnimation()}
      </div>
    </div>
  )
}

/**
 * Animated page transition
 */
export function PageTransition({ children, isLoading = false }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isLoading])

  return (
    <div className={`transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {children}
    </div>
  )
}

export default {
  NetworkLoadingAnimation,
  DataLoadingAnimation,
  VisualizationLoadingAnimation,
  FilterLoadingAnimation,
  SkeletonCard,
  ProgressiveLoadingAnimation,
  LoadingOverlay,
  PageTransition
}
