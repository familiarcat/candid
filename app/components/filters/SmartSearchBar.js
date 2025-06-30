// Smart search bar with AI-powered natural language filtering
// Converts natural language queries into structured filters

import { useState, useEffect, useRef } from 'react'
import { useIntelligentFilters } from '../../lib/advancedFiltering'
import { AnimatedIcon } from '../animations/HoverEffects'
import { cssAnimator } from '../../lib/animationSystem'
import { mobileDetector } from '../../lib/mobileAnimations'

export default function SmartSearchBar({ 
  onSearch, 
  placeholder = "Search or describe what you're looking for...",
  className = '' 
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const intelligentFilters = useIntelligentFilters()

  // Natural language processing patterns
  const nlpPatterns = {
    skills: /(?:with|having|knows?|skilled in|experienced in)\s+([^,\n]+)/gi,
    experience: /(?:(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?)/gi,
    location: /(?:in|at|from|located in)\s+([A-Za-z\s,]+?)(?:\s|$|,)/gi,
    company: /(?:at|from|works? at|employed by)\s+([A-Za-z\s&,]+?)(?:\s|$|,)/gi,
    remote: /(?:remote|work from home|wfh|distributed|virtual)/gi,
    seniority: /(?:senior|lead|junior|mid-level|executive|manager|director)/gi,
    salary: /(?:\$(\d+)k?|\$(\d+),(\d+))/gi
  }

  // Process natural language query
  const processNaturalLanguage = (text) => {
    const filters = {}
    
    // Extract skills
    const skillMatches = [...text.matchAll(nlpPatterns.skills)]
    if (skillMatches.length > 0) {
      const skills = skillMatches.map(match => match[1].trim())
      filters.skillCategories = skills
    }

    // Extract experience
    const expMatches = [...text.matchAll(nlpPatterns.experience)]
    if (expMatches.length > 0) {
      const years = parseInt(expMatches[0][1])
      filters.experienceRange = { min: years, max: years + 5 }
    }

    // Extract location
    const locationMatches = [...text.matchAll(nlpPatterns.location)]
    if (locationMatches.length > 0) {
      const locations = locationMatches.map(match => match[1].trim())
      filters.locations = locations
    }

    // Extract remote work preference
    if (nlpPatterns.remote.test(text)) {
      filters.remoteWork = 'remote'
    }

    // Extract seniority
    const seniorityMatch = text.match(nlpPatterns.seniority)
    if (seniorityMatch) {
      filters.seniorityLevels = [seniorityMatch[0]]
    }

    return filters
  }

  // Generate search suggestions
  const generateSuggestions = (query) => {
    const suggestions = []
    
    if (query.length < 2) return suggestions

    // Common search patterns
    const commonPatterns = [
      'Senior developers with React experience',
      'Remote data scientists in California',
      'Marketing managers with 5+ years experience',
      'Junior developers at startups',
      'Full-stack engineers in New York',
      'Product managers with AI experience',
      'DevOps engineers with AWS skills',
      'UX designers at tech companies'
    ]

    // Filter patterns that match the query
    const matchingPatterns = commonPatterns.filter(pattern =>
      pattern.toLowerCase().includes(query.toLowerCase())
    )

    suggestions.push(...matchingPatterns.slice(0, 3))

    // Add entity-specific suggestions
    if (query.toLowerCase().includes('developer') || query.toLowerCase().includes('engineer')) {
      suggestions.push('Show all software engineering positions')
    }

    if (query.toLowerCase().includes('remote')) {
      suggestions.push('Filter for remote work opportunities')
    }

    if (query.toLowerCase().includes('startup')) {
      suggestions.push('Show positions at startup companies')
    }

    return suggestions.slice(0, 5)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.length > 1) {
      const newSuggestions = generateSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle search execution
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)

    try {
      // Process natural language
      const extractedFilters = processNaturalLanguage(searchQuery)
      
      // Apply filters to intelligent filter engine
      for (const [filterId, value] of Object.entries(extractedFilters)) {
        intelligentFilters.setFilter(filterId, value)
      }

      // Trigger search callback
      onSearch?.(searchQuery, extractedFilters)

      // Animate search icon
      if (inputRef.current) {
        await cssAnimator.pulse(inputRef.current, { pulses: 1, intensity: 1.1 })
      }

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Animate suggestions appearance
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      cssAnimator.fadeIn(suggestionsRef.current, { 
        duration: mobileDetector.getOptimalAnimationDuration(200) 
      })
    }
  }, [showSuggestions])

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <AnimatedIcon animation="rotate" trigger="hover">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </AnimatedIcon>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
            mobileDetector.isMobile ? 'text-base' : 'text-sm'
          }`}
          disabled={isLoading}
        />

        {/* Search Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className={`p-1 rounded-md transition-colors ${
              query.trim() && !isLoading
                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-900">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Tips */}
      {query.length === 0 && (
        <div className="mt-2 text-xs text-gray-500">
          <p>💡 Try: "Senior React developers in San Francisco" or "Remote data scientists with 5+ years"</p>
        </div>
      )}
    </div>
  )
}

// Smart Search Results Component
export function SmartSearchResults({ 
  query, 
  results = [], 
  isLoading = false,
  onClearSearch,
  className = '' 
}) {
  if (!query && !isLoading) return null

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-medium text-blue-900">
            {isLoading ? 'Searching...' : `Search Results for "${query}"`}
          </h3>
        </div>
        
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center text-sm text-blue-700">
          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing your search...
        </div>
      ) : (
        <p className="text-sm text-blue-700">
          Found {results.length} result{results.length !== 1 ? 's' : ''} matching your search criteria
        </p>
      )}
    </div>
  )
}

export default SmartSearchBar
