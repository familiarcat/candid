// Advanced filtering system for enhanced data exploration
// Provides comprehensive filtering capabilities across all entity types

import { useState, useEffect } from 'react'

export default function AdvancedFilterPanel({
  entityType,
  data = [],
  onFiltersChange,
  initialFilters = {},
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <span className="mr-1">✕</span>
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <>
                  <span className="mr-1">▲</span>
                  Collapse
                </>
              ) : (
                <>
                  <span className="mr-1">▼</span>
                  Expand
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
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
    </div>
  )
}
