import { useState, useMemo, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import VisualizationModal from '../components/VisualizationModal'
import { useData } from '../contexts/DataContext'
import { usePageVisualization } from '../hooks/useComponentVisualization'
import { VisualizationDataProvider } from '../components/visualizations/VisualizationDataProvider'
import AdvancedFilterPanel from '../components/filters/AdvancedFilterPanel'
import { useMatchFilters } from '../hooks/useAdvancedFilters'
import EnhancedMatchCard from '../components/ui/EnhancedMatchCard'
import { OptimizedCardGrid } from '../components/optimization/PerformanceOptimizedComponents'
import { performanceMonitor } from '../lib/performanceOptimizer'

function MatchesContent() {
  const router = useRouter()
  const { matches, loading, errors } = useData()
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [actionLoading, setActionLoading] = useState({})

  // Component-specific visualization
  const visualization = usePageVisualization('match', {
    maxDistance: 2,
    layoutType: 'radial'
  })

  // Advanced filtering system
  const advancedFilters = useMatchFilters(matches, {
    persistFilters: true,
    storageKey: 'matches-advanced-filters'
  })

  // Data comes from DataContext - no need for useEffect



  // Memoized filtering for performance
  const filteredMatches = useMemo(() => {
    performanceMonitor.recordMetric('MatchesFilter', Date.now(), 'timestamp')
    return (matches || []).filter(match => {
      if (filterStatus === 'all') return true
      return match.status === filterStatus
    })
  }, [matches, filterStatus])

  // Memoized sorting for performance
  const sortedMatches = useMemo(() => {
    performanceMonitor.recordMetric('MatchesSort', Date.now(), 'timestamp')
    return [...filteredMatches].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0)
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'name':
          return (a.jobSeeker?.name || '').localeCompare(b.jobSeeker?.name || '')
        default:
          return 0
      }
    })
  }, [filteredMatches, sortBy])

  // Memoized match tiers for performance
  const matchTiers = useMemo(() => {
    const excellent = sortedMatches.filter(m => (m.matchScore || m.score || 0) >= 90)
    const high = sortedMatches.filter(m => (m.matchScore || m.score || 0) >= 80 && (m.matchScore || m.score || 0) < 90)
    const good = sortedMatches.filter(m => (m.matchScore || m.score || 0) >= 60 && (m.matchScore || m.score || 0) < 80)
    const potential = sortedMatches.filter(m => (m.matchScore || m.score || 0) < 60)

    return { excellent, high, good, potential }
  }, [sortedMatches])



  // Memoized action handler for performance
  const handleAction = useCallback(async (matchId, action) => {
    performanceMonitor.recordMetric('MatchAction', Date.now(), 'timestamp', { action })
    setActionLoading(prev => ({ ...prev, [matchId]: true }))

    try {
      // Make API call to update match status
      const response = await fetch(`/api/matches?id=${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          adminNote: action === 'rejected'
            ? 'Admin determined this specific match is not suitable. Job seeker remains in talent pool.'
            : action === 'approved'
            ? 'Admin approved this match for further consideration.'
            : null
        }),
      })

      if (response.ok) {
        // Refresh matches data from DataContext
        // The DataContext will automatically update the UI
        console.log(`Match ${matchId} ${action} successfully`)
        performanceMonitor.recordMetric('MatchActionSuccess', 1, 'count')
      } else {
        throw new Error('Failed to update match status')
      }

    } catch (error) {
      console.error('Error updating match status:', error)
      performanceMonitor.recordMetric('MatchActionError', 1, 'count')
      // Handle error state
    } finally {
      setActionLoading(prev => ({ ...prev, [matchId]: false }))
    }
  }, [setActionLoading])

  // More specific loading check to prevent infinite loops
  if (loading.matches || loading.global) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Loading matches...</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Enhanced error handling with proper filtering and logging
  const activeErrors = Object.entries(errors || {})
    .filter(([, error]) => error !== null && error !== undefined)
    .map(([key, error]) => `${key}: ${error}`)

  if (activeErrors.length > 0) {
    console.error('Matches page errors:', errors)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="font-semibold mb-2">Error loading data:</div>
            <ul className="list-disc list-inside space-y-1">
              {activeErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Matches | Candid Connections Katra</title>
        <meta name="description" content="Job seeker to hiring authority matches based on graph database connections and company hierarchy." />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-800 mb-4">
            Matches
          </h1>
          <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
            Job seekers connected to the right hiring authorities through intelligent matching and network analysis.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{(matches || []).length}</div>
            <div className="text-sm text-candid-gray-500">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(matches || []).filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-candid-gray-500">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(matches || []).filter(m => m.status === 'approved').length}
            </div>
            <div className="text-sm text-candid-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {(matches || []).filter(m => m.status === 'rejected').length}
            </div>
            <div className="text-sm text-candid-gray-500">Rejected</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Filter & Sort Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="score">Match Score (High to Low)</option>
                  <option value="date">Date Created (Newest First)</option>
                  <option value="name">Job Seeker Name (A-Z)</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => router.push('/visualizations')}
                  className="btn-secondary flex-1"
                >
                  📊 Global Network
                </button>
                {visualization.pageHelpers.renderVisualizationButton('btn-primary flex-1')}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {sortedMatches.length} of {(matches || []).length} matches
              </span>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filtering Panel */}
        <AdvancedFilterPanel
          entityType="match"
          data={matches}
          onFiltersChange={advancedFilters.updateFilter}
          initialFilters={advancedFilters.filters}
          className="mb-6"
        />

        {/* Enhanced Matches Grid with Quality Tiers */}
        <div className="space-y-8">
          {/* Excellent Matches (90%+) */}
          {matchTiers.excellent.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Excellent Matches</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {matchTiers.excellent.length} matches
                  </span>
                </div>
              </div>
              <OptimizedCardGrid
                items={matchTiers.excellent}
                renderCard={(match) => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={match}
                    tier="excellent"
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                )}
                columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                gap={6}
              />
            </div>
          )}

          {/* High Quality Matches (80-89%) */}
          {matchTiers.high.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">High Quality Matches</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {matchTiers.high.length} matches
                  </span>
                </div>
              </div>
              <OptimizedCardGrid
                items={matchTiers.high}
                renderCard={(match) => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={match}
                    tier="high"
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                )}
                columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                gap={6}
              />
            </div>
          )}

          {/* Good Matches (60-79%) */}
          {matchTiers.good.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Good Matches</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {matchTiers.good.length} matches
                  </span>
                </div>
              </div>
              <OptimizedCardGrid
                items={matchTiers.good}
                renderCard={(match) => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={match}
                    tier="good"
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                )}
                columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                gap={6}
              />
            </div>
          )}

          {/* Lower Quality Matches (<60%) */}
          {matchTiers.potential.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900">Potential Matches</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {matchTiers.potential.length} matches
                  </span>
                </div>
              </div>
              <OptimizedCardGrid
                items={matchTiers.potential}
                renderCard={(match) => (
                  <EnhancedMatchCard
                    key={match.id}
                    match={match}
                    tier="potential"
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                )}
                columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                gap={6}
              />
            </div>
          )}
        </div>

        {/* Empty State */}
        {sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all'
                ? 'No matches available at this time.'
                : `No ${filterStatus} matches found. Try adjusting your filters.`
              }
            </p>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="btn-primary"
              >
                Show All Matches
              </button>
            )}
          </div>
        )}

        {/* Workflow Information */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">
              📋 Match Review Workflow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Pending Review</h4>
                <p className="text-sm text-gray-600">
                  New matches await admin review and approval decision.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Approved</h4>
                <p className="text-sm text-gray-600">
                  Admin approved this match for further consideration and outreach.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-600 text-xl">✗</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Rejected</h4>
                <p className="text-sm text-gray-600">
                  This specific match was rejected. <strong>Job seeker remains in talent pool.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Modal */}
        <VisualizationModal {...visualization.pageHelpers.getModalProps()} />
      </div>
    </Layout>
  )
}

// Main component with VisualizationDataProvider wrapper
export default function Matches() {
  return (
    <VisualizationDataProvider>
      <MatchesContent />
    </VisualizationDataProvider>
  )
}