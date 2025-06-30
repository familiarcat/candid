// Performance-optimized React components with intelligent rendering
// Provides optimized components for better performance and user experience

import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { performanceMonitor } from '../../lib/performanceOptimizer'
import { useOptimizedFetch } from '../../lib/dataOptimizer'
import { mobileDetector } from '../../lib/mobileAnimations'

/**
 * Virtualized List for rendering large datasets efficiently
 */
export const VirtualizedList = memo(function VirtualizedList({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = ''
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, visibleRange])

  // Handle scroll with throttling
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop
    setScrollTop(newScrollTop)
    
    // Record scroll performance
    performanceMonitor.recordMetric('VirtualListScroll', newScrollTop, 'px')
  }, [])

  // Throttled scroll handler for better performance
  const throttledScrollHandler = useMemo(() => {
    let ticking = false
    return (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(e)
          ticking = false
        })
        ticking = true
      }
    }
  }, [handleScroll])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={throttledScrollHandler}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

/**
 * Lazy Image component with intersection observer
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  placeholder = '/placeholder.svg',
  className = '',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    performanceMonitor.recordMetric('ImageLoad', 1, 'count')
  }, [])

  const handleError = useCallback(() => {
    console.warn('Image failed to load:', src)
    performanceMonitor.recordMetric('ImageError', 1, 'count')
  }, [src])

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      <img
        src={isInView ? src : placeholder}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        }`}
        {...props}
      />
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  )
})

/**
 * Optimized data table with virtualization and sorting
 */
export const OptimizedDataTable = memo(function OptimizedDataTable({
  data = [],
  columns = [],
  pageSize = 50,
  sortable = true,
  filterable = true,
  className = ''
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filterText, setFilterText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply filter
    if (filterText) {
      result = result.filter(row =>
        columns.some(col =>
          String(row[col.key] || '').toLowerCase().includes(filterText.toLowerCase())
        )
      )
    }

    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, columns, filterText, sortConfig])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const totalPages = Math.ceil(processedData.length / pageSize)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter */}
      {filterable && (
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Filter data..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">
            {processedData.length} of {data.length} rows
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && sortConfig.key === column.key && (
                      <span className="text-blue-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

/**
 * Performance-optimized card grid with lazy loading
 */
export const OptimizedCardGrid = memo(function OptimizedCardGrid({
  items = [],
  renderCard,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  loadMore,
  hasMore = false,
  loading = false,
  className = ''
}) {
  const [visibleItems, setVisibleItems] = useState(20)
  const loadMoreRef = useRef(null)

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          if (loadMore) {
            loadMore()
          } else {
            setVisibleItems(prev => prev + 20)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  const displayItems = useMemo(() => {
    return items.slice(0, visibleItems)
  }, [items, visibleItems])

  const gridCols = useMemo(() => {
    if (typeof window === 'undefined') return columns.lg || 4

    const width = window.innerWidth
    if (width < 640) return columns.xs || 1
    if (width < 768) return columns.sm || 2
    if (width < 1024) return columns.md || 3
    return columns.lg || 4
  }, [columns])

  return (
    <div className={className}>
      <div
        className={`grid gap-${gap}`}
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
        }}
      >
        {displayItems.map((item, index) => (
          <div key={item.id || index}>
            {renderCard(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {(hasMore || visibleItems < items.length) && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          {loading ? (
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading more...</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (loadMore) {
                  loadMore()
                } else {
                  setVisibleItems(prev => prev + 20)
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  )
})

/**
 * Optimized search with debouncing
 */
export const OptimizedSearch = memo(function OptimizedSearch({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  className = ''
}) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef(null)

  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        await onSearch(searchQuery)
      } finally {
        setIsSearching(false)
      }
    }, debounceMs)
  }, [onSearch, debounceMs])

  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }, [debouncedSearch])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
    </div>
  )
})

export default {
  VirtualizedList,
  LazyImage,
  OptimizedDataTable,
  OptimizedCardGrid,
  OptimizedSearch
}
