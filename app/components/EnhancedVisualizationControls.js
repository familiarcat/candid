// Enhanced Visualization Controls - Responsive controls for edge depth, sorting, and filtering
// Fixes width overflow issues and provides intuitive user controls

import { useState } from 'react'
import { SORTING_METHODS } from '../lib/visualizationSorting'

export default function EnhancedVisualizationControls({
  viewMode = '2D',
  onViewModeChange = () => {},
  edgeDepth = 2,
  onEdgeDepthChange = () => {},
  sortMethod = SORTING_METHODS.RELATIONSHIP_STRENGTH,
  onSortMethodChange = () => {},
  filters = {},
  onFiltersChange = () => {},
  showMatchReasons = true,
  onShowMatchReasonsChange = () => {},
  compact = false
}) {
  const [activeTab, setActiveTab] = useState('view')

  const handleFilterChange = (filterKey, value) => {
    onFiltersChange({
      ...filters,
      [filterKey]: value
    })
  }

  const sortOptions = [
    { value: SORTING_METHODS.RELATIONSHIP_STRENGTH, label: 'Match Strength', icon: '🎯' },
    { value: SORTING_METHODS.ENTITY_TYPE, label: 'Entity Type', icon: '📊' },
    { value: SORTING_METHODS.ALPHABETICAL, label: 'Alphabetical', icon: '🔤' },
    { value: SORTING_METHODS.TEMPORAL, label: 'Recent Activity', icon: '⏰' }
  ]

  const entityFilters = [
    { key: 'showCompanies', label: 'Companies', icon: '🏢', color: 'purple' },
    { key: 'showAuthorities', label: 'Authorities', icon: '👔', color: 'cyan' },
    { key: 'showJobSeekers', label: 'Job Seekers', icon: '👥', color: 'orange' },
    { key: 'showSkills', label: 'Skills', icon: '🛠️', color: 'green' },
    { key: 'showPositions', label: 'Positions', icon: '📋', color: 'red' }
  ]

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => onViewModeChange('2D')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  viewMode === '2D' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => onViewModeChange('3D')}
                className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === '3D' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                3D
              </button>
            </div>
          </div>

          {/* Edge Depth Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Depth:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdgeDepthChange(Math.max(1, edgeDepth - 1))}
                disabled={edgeDepth <= 1}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{edgeDepth}</span>
              <button
                onClick={() => onEdgeDepthChange(Math.min(5, edgeDepth + 1))}
                disabled={edgeDepth >= 5}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Sort Method */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortMethod}
              onChange={(e) => onSortMethodChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Match Reasons Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMatchReasons}
                onChange={(e) => onShowMatchReasonsChange(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Match Reasons</span>
            </label>
          </div>
        </div>

        {/* Entity Filters - Second Row */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Show:</span>
            {entityFilters.map(filter => (
              <label key={filter.key} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[filter.key] !== false}
                  onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  {filter.icon} {filter.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Full controls for non-compact mode
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 py-3">
          {[
            { id: 'view', label: 'View', icon: '👁️' },
            { id: 'depth', label: 'Depth', icon: '🔍' },
            { id: 'sort', label: 'Sort', icon: '📊' },
            { id: 'filter', label: 'Filter', icon: '🎛️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'view' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Visualization Mode</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onViewModeChange('2D')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  viewMode === '2D'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">2D Network</div>
                <div className="text-sm text-gray-600">Interactive force-directed graph</div>
              </button>
              <button
                onClick={() => onViewModeChange('3D')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  viewMode === '3D'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🌐</div>
                <div className="font-medium">3D Network</div>
                <div className="text-sm text-gray-600">Immersive spatial visualization</div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'depth' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Edge Depth Control</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Connection Levels: {edgeDepth}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdgeDepthChange(Math.max(1, edgeDepth - 1))}
                    disabled={edgeDepth <= 1}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onEdgeDepthChange(Math.min(5, edgeDepth + 1))}
                    disabled={edgeDepth >= 5}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={edgeDepth}
                onChange={(e) => onEdgeDepthChange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Controls how many levels of connections to display from the root node
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sort' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sorting Method</h4>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sortMethod"
                    value={option.value}
                    checked={sortMethod === option.value}
                    onChange={(e) => onSortMethodChange(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'filter' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Entity Filters</h4>
            <div className="space-y-3">
              {entityFilters.map(filter => (
                <label key={filter.key} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{filter.icon}</span>
                    <span className="text-sm font-medium">{filter.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters[filter.key] !== false}
                    onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
