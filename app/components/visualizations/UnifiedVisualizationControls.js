// Unified Visualization Controls - Comprehensive control panel for enhanced visualizations
// Provides root node selection, sorting, filtering, and layout controls

import { useState, useEffect, useRef } from 'react'
import { SORTING_METHODS, getAvailableSortingMethods, getSortingMethodLabel } from '../../../lib/visualizationSorting'
import { cssAnimator, ANIMATION_CONFIG } from '../../../lib/animationSystem'

export default function UnifiedVisualizationControls({
  // Data props
  entities = {},
  currentRootNode = null,
  currentSortMethod = SORTING_METHODS.RELATIONSHIP_STRENGTH,
  currentFilters = {},
  currentLayout = 'force',
  visualizationMode = '2d', // '2d' or '3d'

  // Callback props
  onRootNodeChange = () => {},
  onSortMethodChange = () => {},
  onFiltersChange = () => {},
  onLayoutChange = () => {},
  onVisualizationModeChange = () => {},
  onResetView = () => {},

  // UI props
  compact = false,
  showAdvanced = true,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [activeTab, setActiveTab] = useState('root') // 'root', 'sort', 'filter', 'layout'
  const tabContentRef = useRef(null)

  // Get available sorting methods for current root node type
  const availableSortMethods = currentRootNode
    ? getAvailableSortingMethods(currentRootNode.type)
    : Object.values(SORTING_METHODS)

  // Entity type configurations
  const entityTypeConfigs = {
    companies: { icon: '🏢', label: 'Companies', color: 'blue' },
    authorities: { icon: '👔', label: 'Hiring Authorities', color: 'green' },
    jobSeekers: { icon: '👥', label: 'Job Seekers', color: 'purple' },
    skills: { icon: '🛠️', label: 'Skills', color: 'orange' },
    positions: { icon: '📋', label: 'Positions', color: 'red' }
  }

  // Animated tab switching
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return

    // Animate out current content
    if (tabContentRef.current) {
      cssAnimator.animate(tabContentRef.current, {
        opacity: '0',
        transform: 'translateY(-10px)'
      }, {
        duration: ANIMATION_CONFIG.DURATION.FAST,
        onComplete: () => {
          setActiveTab(newTab)
          // Animate in new content
          cssAnimator.animate(tabContentRef.current, {
            opacity: '1',
            transform: 'translateY(0px)'
          }, {
            duration: ANIMATION_CONFIG.DURATION.FAST
          })
        }
      })
    } else {
      setActiveTab(newTab)
    }
  }

  // Handle root node selection
  const handleRootNodeSelect = (entityType, entityId) => {
    const entity = entities[entityType]?.find(e => e.id === entityId)
    if (entity) {
      onRootNodeChange({
        ...entity,
        type: entityType.slice(0, -1) // Remove 's' from plural
      })
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...currentFilters,
      [filterType]: value
    }
    onFiltersChange(newFilters)
  }

  if (compact && !isExpanded) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {currentRootNode ? `${currentRootNode.name}` : 'Select Root Node'}
            </span>
            {currentRootNode && (
              <span className="text-xs text-gray-500">
                ({getSortingMethodLabel(currentSortMethod)})
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Visualization Controls</h3>
        <div className="flex items-center space-x-2">
          {/* 2D/3D Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onVisualizationModeChange('2d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                visualizationMode === '2d'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => onVisualizationModeChange('3d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                visualizationMode === '3d'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3D
            </button>
          </div>

          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'root', label: 'Root Node', icon: '🎯' },
          { id: 'sort', label: 'Sorting', icon: '📊' },
          { id: 'filter', label: 'Filters', icon: '🔍' },
          { id: 'layout', label: 'Layout', icon: '🎨' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div ref={tabContentRef} className="p-4 transition-all duration-200">
        {/* Root Node Selection */}
        {activeTab === 'root' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Root Node
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Choose the entity to focus the visualization around
              </p>
            </div>

            {Object.entries(entityTypeConfigs).map(([entityType, config]) => {
              const entityList = entities[entityType] || []
              if (entityList.length === 0) return null

              return (
                <div key={entityType} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="mr-2">{config.icon}</span>
                    {config.label} ({entityList.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {entityList.map(entity => (
                      <button
                        key={entity.id}
                        onClick={() => handleRootNodeSelect(entityType, entity.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          currentRootNode?.id === entity.id
                            ? `bg-${config.color}-100 text-${config.color}-800 border border-${config.color}-200`
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {entity.name || entity.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sorting Controls */}
        {activeTab === 'sort' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Connected Nodes By
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Choose how to order nodes connected to the root
              </p>
            </div>

            <div className="space-y-2">
              {availableSortMethods.map(method => (
                <button
                  key={method}
                  onClick={() => onSortMethodChange(method)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    currentSortMethod === method
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {getSortingMethodLabel(method)}
                </button>
              ))}
            </div>

            {/* Sort Direction */}
            <div className="pt-2 border-t border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentFilters.ascending || false}
                  onChange={(e) => handleFilterChange('ascending', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ascending order</span>
              </label>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        {activeTab === 'filter' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Entity Types
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Filter which types of entities to display
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(entityTypeConfigs).map(([entityType, config]) => (
                <label key={entityType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!currentFilters.hiddenTypes?.includes(entityType)}
                    onChange={(e) => {
                      const hiddenTypes = currentFilters.hiddenTypes || []
                      const newHiddenTypes = e.target.checked
                        ? hiddenTypes.filter(type => type !== entityType)
                        : [...hiddenTypes, entityType]
                      handleFilterChange('hiddenTypes', newHiddenTypes)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="mr-2">{config.icon}</span>
                    {config.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Distance Filter */}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={currentFilters.maxDistance || 3}
                onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 hop</span>
                <span>{currentFilters.maxDistance || 3} hops</span>
                <span>5 hops</span>
              </div>
            </div>
          </div>
        )}

        {/* Layout Controls */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Algorithm
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Choose how nodes are positioned
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'force', label: 'Force-Directed', description: 'Physics-based positioning' },
                { id: 'radial', label: 'Radial', description: 'Circular arrangement around root' },
                { id: 'hierarchical', label: 'Hierarchical', description: 'Layered by entity type' }
              ].map(layout => (
                <button
                  key={layout.id}
                  onClick={() => onLayoutChange(layout.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentLayout === layout.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{layout.label}</div>
                  <div className="text-xs text-gray-500">{layout.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onResetView}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Reset View
        </button>

        <div className="text-xs text-gray-500">
          {currentRootNode ? (
            <>Root: {currentRootNode.name}</>
          ) : (
            'No root node selected'
          )}
        </div>
      </div>
    </div>
  )
}
