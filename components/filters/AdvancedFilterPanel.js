// Advanced filtering system for enhanced data exploration
// Provides comprehensive filtering capabilities across all entity types
// Enhanced with intelligent suggestions and real-time filtering

import { useState, useEffect, useRef } from 'react'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'
import { useIntelligentFilters } from '../../lib/advancedFiltering'
import { AnimatedButton, AnimatedIcon } from '../animations/HoverEffects'
import { mobileDetector } from '../../lib/mobileAnimations'

export default function AdvancedFilterPanel({
  entityType,
  data = [],
  onFiltersChange,
  initialFilters = {},
  className = '',
  showPresets = true,
  showSuggestions = true
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState('filters')
  const contentRef = useRef(null)
  const intelligentFilters = useIntelligentFilters()
  const [intelligentState, setIntelligentState] = useState(intelligentFilters.getState())
  const [filters, setFilters] = useState({
    // Entity Type Filters
    entityTypes: ['company', 'authority', 'jobSeeker', 'skill', 'position'],

    // Relationship Filters
    relationshipStrength: { min: 0, max: 100 },
    connectionTypes: ['employment', 'match', 'skill', 'requirement'],

    // Temporal Filters
    dateRange: { start: null, end: null },
    activityLevel: 'all', // all, high, medium, low

    // Geographic Filters
    locations: [],
    remoteWork: 'all', // all, remote, onsite, hybrid

    // Skill-Based Filters
    skillCategories: [],
    skillLevels: [], // beginner, intermediate, advanced, expert

    // Company-Based Filters
    companyIndustries: [],
    companySizes: [], // startup, small, medium, large, enterprise

    // Match Quality Filters
    matchScoreRange: { min: 0, max: 100 },
    matchStatus: 'all', // all, pending, approved, rejected

    // Experience Filters
    experienceRange: { min: 0, max: 20 },
    seniorityLevels: [], // junior, mid, senior, lead, executive

    ...initialFilters
  })

  // Subscribe to intelligent filter changes
  useEffect(() => {
    const unsubscribe = intelligentFilters.subscribe((newState) => {
      setIntelligentState(newState)
      // Merge intelligent filters with local filters
      const mergedFilters = { ...filters }
      for (const [filterId, filter] of Object.entries(newState.activeFilters)) {
        mergedFilters[filterId] = filter.value
      }
      setFilters(mergedFilters)
    })

    return unsubscribe
  }, [intelligentFilters])

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  // Get unique values from data for filter options
  const getUniqueValues = (field, subField = null) => {
    if (!data || data.length === 0) return []

    const values = data.map(item => {
      if (subField) {
        return item[field]?.[subField]
      }
      return item[field]
    }).filter(Boolean)

    return [...new Set(values)].sort()
  }

  // Get filter options based on entity type and data
  const filterOptions = {
    industries: getUniqueValues('industry'),
    locations: getUniqueValues('location'),
    skillCategories: getUniqueValues('category'),
    companySizes: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
    seniorityLevels: ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    connectionTypes: ['Employment', 'Match', 'Skill', 'Requirement', 'Hierarchy']
  }

  const updateFilter = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const updateArrayFilter = (filterKey, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: checked
        ? [...prev[filterKey], value]
        : prev[filterKey].filter(item => item !== value)
    }))
  }

  const updateRangeFilter = (filterKey, rangeKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        [rangeKey]: value
      }
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      entityTypes: ['company', 'authority', 'jobSeeker', 'skill', 'position'],
      relationshipStrength: { min: 0, max: 100 },
      connectionTypes: ['employment', 'match', 'skill', 'requirement'],
      dateRange: { start: null, end: null },
      activityLevel: 'all',
      locations: [],
      remoteWork: 'all',
      skillCategories: [],
      skillLevels: [],
      companyIndustries: [],
      companySizes: [],
      matchScoreRange: { min: 0, max: 100 },
      matchStatus: 'all',
      experienceRange: { min: 0, max: 20 },
      seniorityLevels: []
    })
  }

  const getActiveFilterCount = () => {
    let count = 0

    // Count non-default filters
    if (filters.entityTypes.length < 5) count++
    if (filters.relationshipStrength.min > 0 || filters.relationshipStrength.max < 100) count++
    if (filters.connectionTypes.length < 4) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.activityLevel !== 'all') count++
    if (filters.locations.length > 0) count++
    if (filters.remoteWork !== 'all') count++
    if (filters.skillCategories.length > 0) count++
    if (filters.skillLevels.length > 0) count++
    if (filters.companyIndustries.length > 0) count++
    if (filters.companySizes.length > 0) count++
    if (filters.matchScoreRange.min > 0 || filters.matchScoreRange.max < 100) count++
    if (filters.matchStatus !== 'all') count++
    if (filters.experienceRange.min > 0 || filters.experienceRange.max < 20) count++
    if (filters.seniorityLevels.length > 0) count++

    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Handle animated expand/collapse
  const handleToggleExpanded = async () => {
    if (isAnimating) return

    setIsAnimating(true)

    if (isExpanded) {
      // Collapse animation
      await cssAnimator.slideUp(contentRef.current)
      setIsExpanded(false)
    } else {
      // Expand animation
      setIsExpanded(true)
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 10))
      await cssAnimator.slideDown(contentRef.current)
    }

    setIsAnimating(false)
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {(activeFilterCount > 0 || intelligentState.stats.hasActiveFilters) && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {Math.max(activeFilterCount, intelligentState.stats.activeCount)} active
              </span>
            )}
            {intelligentState.suggestions?.intelligent?.size > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
                🧠 Smart suggestions
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {(activeFilterCount > 0 || intelligentState.stats.hasActiveFilters) && (
              <AnimatedButton
                onClick={() => {
                  clearAllFilters()
                  intelligentFilters.clearAll()
                }}
                variant="secondary"
                size="small"
                className="text-xs"
              >
                <span className="mr-1">✕</span>
                Clear All
              </AnimatedButton>
            )}
            <button
              onClick={handleToggleExpanded}
              disabled={isAnimating}
              className={`flex items-center text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 ${
                isAnimating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <AnimatedIcon animation="rotate" trigger="hover">
                <span
                  className={`mr-1 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  ▼
                </span>
              </AnimatedIcon>
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (when expanded) */}
      {isExpanded && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('filters')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'filters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">🔍</span>
              Filters
            </button>

            {showPresets && (
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'presets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">⚡</span>
                Presets
              </button>
            )}

            {showSuggestions && (
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'suggestions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">🧠</span>
                Smart
                {intelligentState.suggestions?.intelligent?.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Filter Content */}
      {isExpanded && (
        <div
          ref={contentRef}
          className="p-4 space-y-6 overflow-hidden"
        >
          {/* Tab Content */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
          {/* Entity Type Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Types</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['company', 'authority', 'jobSeeker', 'skill', 'position'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.entityTypes.includes(type)}
                    onChange={(e) => updateArrayFilter('entityTypes', type, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relationship Strength */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Strength ({filters.relationshipStrength.min}% - {filters.relationshipStrength.max}%)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.relationshipStrength.min}
                onChange={(e) => updateRangeFilter('relationshipStrength', 'min', parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.relationshipStrength.max}
                onChange={(e) => updateRangeFilter('relationshipStrength', 'max', parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Geographic Filters */}
          {filterOptions.locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {filterOptions.locations.slice(0, 12).map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={(e) => updateArrayFilter('locations', location, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 truncate">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Industry Filters */}
          {filterOptions.industries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industries</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {filterOptions.industries.map(industry => (
                  <label key={industry} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.companyIndustries.includes(industry)}
                      onChange={(e) => updateArrayFilter('companyIndustries', industry, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 truncate">{industry}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Match Score Range (for matches page) */}
          {entityType === 'match' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Score Range ({filters.matchScoreRange.min}% - {filters.matchScoreRange.max}%)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.matchScoreRange.min}
                  onChange={(e) => updateRangeFilter('matchScoreRange', 'min', parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.matchScoreRange.max}
                  onChange={(e) => updateRangeFilter('matchScoreRange', 'max', parseInt(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Experience Range (for job seekers) */}
          {entityType === 'jobSeeker' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Range ({filters.experienceRange.min} - {filters.experienceRange.max} years)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.experienceRange.min}
                  onChange={(e) => updateRangeFilter('experienceRange', 'min', parseInt(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.experienceRange.max}
                  onChange={(e) => updateRangeFilter('experienceRange', 'max', parseInt(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          )}
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && showPresets && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Quick filter combinations for common use cases
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {intelligentState.presets?.map((preset) => (
                  <div
                    key={preset.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => intelligentFilters.applyPreset(preset.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{preset.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                      </div>
                      <AnimatedButton
                        onClick={(e) => {
                          e.stopPropagation()
                          intelligentFilters.applyPreset(preset.id)
                        }}
                        variant="primary"
                        size="small"
                        className="ml-2"
                      >
                        Apply
                      </AnimatedButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Suggestions Tab */}
          {activeTab === 'suggestions' && showSuggestions && (
            <div className="space-y-4">
              {intelligentState.suggestions?.intelligent?.size > 0 ? (
                <>
                  <p className="text-sm text-gray-600">
                    Based on your current filters, you might also want to filter by:
                  </p>

                  {Array.from(intelligentState.suggestions.intelligent.entries()).map(([filterId, suggestion]) => (
                    <div
                      key={filterId}
                      className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900 capitalize">
                            {filterId.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">{suggestion.reason}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {suggestion.suggestions.map((suggestionValue, index) => (
                              <button
                                key={index}
                                onClick={() => intelligentFilters.setFilter(filterId, suggestionValue)}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              >
                                {typeof suggestionValue === 'object'
                                  ? `${suggestionValue.min}-${suggestionValue.max}`
                                  : suggestionValue
                                }
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🧠</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Smart Suggestions</h4>
                  <p className="text-gray-600">
                    Start applying filters to see intelligent suggestions based on your selections.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
