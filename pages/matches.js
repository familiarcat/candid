import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { SkillLink, CompanyLink } from '../components/ui/LinkButton'
import { getMatchColor, formatDate } from '../lib/utils'
import { useData } from '../contexts/DataContext'

export default function Matches() {
  const router = useRouter()
  const { matches, companies, skills, loading, errors } = useData()
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [actionLoading, setActionLoading] = useState({})

  // Data comes from DataContext - no need for useEffect

  // Helper functions
  const getSkillByName = (skillName) => {
    if (!skillName || typeof skillName !== 'string') {
      return {
        name: 'Unknown Skill',
        _key: 'unknown-skill',
        category: 'Technology',
        demand: 'High'
      }
    }
    return skills.find(s => s.name === skillName) || {
      name: skillName,
      _key: skillName.toLowerCase().replace(/\s+/g, '-'),
      category: 'Technology',
      demand: 'High'
    }
  }

  const getCompanyByName = (companyName) => {
    if (!companyName || typeof companyName !== 'string') return null
    return companies.find(c => c.name === companyName) || {
      name: companyName,
      _key: companyName.toLowerCase().replace(/\s+/g, '-'),
      industry: 'Technology',
      employeeCount: 100
    }
  }

  const filteredMatches = (matches || []).filter(match => {
    if (filterStatus === 'all') return true
    return match.status === filterStatus
  })

  const sortedMatches = [...filteredMatches].sort((a, b) => {
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const handleMatchAction = async (matchId, action) => {
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
      } else {
        throw new Error('Failed to update match status')
      }

    } catch (error) {
      console.error('Error updating match status:', error)
      // Handle error state
    } finally {
      setActionLoading(prev => ({ ...prev, [matchId]: false }))
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (errors && Object.keys(errors).length > 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading data: {Object.values(errors).join(', ')}
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

              <div className="flex items-end">
                <button
                  onClick={() => router.push('/visualizations')}
                  className="btn-primary w-full"
                >
                  📊 Visualize Network
                </button>
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

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedMatches.map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Match Score Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.matchScore || match.score || 0)}`}>
                  {Math.round(match.matchScore || match.score || 0)}% Match
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(match.status)}`}>
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </div>
              </div>

              {/* Job Seeker Info */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 font-semibold">
                      {match.jobSeeker?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{match.jobSeeker?.name || 'Unknown'}</h3>
                    <p className="text-gray-600 text-sm">{match.jobSeeker?.title || 'No title'}</p>
                  </div>
                </div>
                {match.jobSeeker?.skills && match.jobSeeker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match.jobSeeker.skills.slice(0, 3).map((skill, index) => (
                      <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                    ))}
                    {match.jobSeeker.skills.length > 3 && (
                      <span className="badge badge-secondary text-xs">
                        +{match.jobSeeker.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hiring Authority Info */}
              {match.hiringAuthority && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900">{match.hiringAuthority.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{match.hiringAuthority.role}</p>
                  <div className="mb-2">
                    <CompanyLink company={getCompanyByName(match.hiringAuthority.company)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {match.hiringAuthority.skillsLookingFor && match.hiringAuthority.skillsLookingFor.slice(0, 3).map((skill, index) => (
                        <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                      ))}
                      {match.hiringAuthority.skillsLookingFor && match.hiringAuthority.skillsLookingFor.length > 3 && (
                        <span className="badge badge-secondary text-xs">
                          +{match.hiringAuthority.skillsLookingFor.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        match.hiringAuthority.hiringPower === 'High' ? 'bg-red-100 text-red-800' :
                        match.hiringAuthority.hiringPower === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      } text-xs`}>
                        {match.hiringAuthority.hiringPower} Power
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Reasons */}
              {match.matchReasons && match.matchReasons.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Why this is a good match:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {match.matchReasons.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Admin Note */}
              {match.adminNote && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Note:</strong> {match.adminNote}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <div>Created {formatDate(match.createdAt)}</div>
                  {match.updatedAt && (
                    <div>Updated {formatDate(match.updatedAt)}</div>
                  )}
                </div>

                {match.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMatchAction(match.id, 'approved')}
                      disabled={actionLoading[match.id]}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {actionLoading[match.id] ? (
                        <>
                          <div className="loading-spinner w-3 h-3"></div>
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleMatchAction(match.id, 'rejected')}
                      disabled={actionLoading[match.id]}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {actionLoading[match.id] ? (
                        <>
                          <div className="loading-spinner w-3 h-3"></div>
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <>
                          <span>✗</span>
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {match.status !== 'pending' && (
                  <div className="text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      match.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {match.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
      </div>
    </Layout>
  )
}