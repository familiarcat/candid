import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { SkillLink, CompanyLink, AuthorityLink } from '../components/ui/LinkButton'
import { getMatchColor, formatDate } from '../lib/utils'

export default function Matches() {
  const router = useRouter()
  const [matches, setMatches] = useState([])
  const [companies, setCompanies] = useState([])
  const [skills, setSkills] = useState([])
  const [authorities, setAuthorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [matchesRes, companiesRes, skillsRes, authoritiesRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/companies'),
          fetch('/api/skills'),
          fetch('/api/hiring-authorities')
        ])

        if (matchesRes.ok && companiesRes.ok && skillsRes.ok && authoritiesRes.ok) {
          const [matchesData, companiesData, skillsData, authoritiesData] = await Promise.all([
            matchesRes.json(),
            companiesRes.json(),
            skillsRes.json(),
            authoritiesRes.json()
          ])

          setMatches(matchesData.matches || matchesData)
          setCompanies(companiesData.companies || companiesData)
          setSkills(skillsData.skills || skillsData)
          setAuthorities(authoritiesData.authorities || authoritiesData)
        } else {
          // Fallback to sample data
          const sampleMatches = [
            {
              id: 'match_1',
              jobSeeker: {
                id: 'js_1',
                name: 'Sarah Chen',
                title: 'Senior Frontend Developer',
                skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
                experience: '6 years'
              },
              hiringAuthority: {
                id: 'auth_1',
                name: 'Mike Wilson',
                role: 'VP Engineering',
                level: 'Executive',
                company: 'TechCorp Inc.',
                companySize: 'Enterprise (1000+)',
                hiringPower: 'High',
                decisionMaker: true
              },
              position: {
                id: 'pos_1',
                title: 'Lead Frontend Engineer',
                requirements: ['React', 'TypeScript', 'Leadership', 'GraphQL']
              },
              score: 92,
              status: 'pending',
              createdAt: new Date('2024-01-15'),
              matchReasons: [
                'Skills align with authority requirements',
                'Experience level matches hiring criteria',
                'Direct path to decision maker'
              ],
              connectionStrength: 'Strong',
              hierarchyMatch: 'Perfect - Executive level for senior role'
            },
            {
              id: 'match_2',
              jobSeeker: {
                id: 'js_2',
                name: 'Marcus Johnson',
                title: 'Full Stack Developer',
                skills: ['Python', 'Django', 'PostgreSQL', 'AWS']
              },
              position: {
                id: 'pos_2',
                title: 'Backend Engineer',
                company: 'DataFlow Systems',
                requirements: ['Python', 'Django', 'Database Design', 'Cloud Platforms']
              },
              score: 87,
              status: 'approved',
              createdAt: new Date('2024-01-14'),
              matchReasons: ['Python expertise', 'Django framework knowledge', 'Cloud experience']
            },
            {
              id: 'match_3',
              jobSeeker: {
                id: 'js_3',
                name: 'Emily Rodriguez',
                title: 'UX Designer',
                skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems']
              },
              position: {
                id: 'pos_3',
                title: 'Senior UX Designer',
                company: 'Design Studio Pro',
                requirements: ['Figma', 'User Research', 'Design Systems', 'Collaboration']
              },
              score: 95,
              status: 'pending',
              createdAt: new Date('2024-01-13'),
              matchReasons: ['Excellent design skills', 'Strong user research background', 'Design systems expertise']
            },
            {
              id: 'match_4',
              jobSeeker: {
                id: 'js_4',
                name: 'David Kim',
                title: 'DevOps Engineer',
                skills: ['Kubernetes', 'Docker', 'Terraform', 'Jenkins']
              },
              position: {
                id: 'pos_4',
                title: 'Cloud Infrastructure Engineer',
                company: 'CloudTech Solutions',
                requirements: ['Kubernetes', 'Infrastructure as Code', 'CI/CD', 'Monitoring']
              },
              score: 78,
              status: 'rejected',
              createdAt: new Date('2024-01-12'),
              matchReasons: ['Kubernetes expertise', 'Infrastructure automation', 'CI/CD pipeline experience']
            }
          ]
          setMatches(sampleMatches)
          setCompanies([])
          setSkills([])
          setAuthorities([])
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper functions
  const getSkillByName = (skillName) => {
    return skills.find(s => s.name === skillName) || {
      name: skillName,
      _key: skillName.toLowerCase().replace(/\s+/g, '-'),
      category: 'Technology',
      demand: 'High'
    }
  }

  const getCompanyByName = (companyName) => {
    return companies.find(c => c.name === companyName) || {
      name: companyName,
      _key: companyName.toLowerCase().replace(/\s+/g, '-'),
      industry: 'Technology',
      employeeCount: 100
    }
  }

  const getAuthorityByName = (authorityName) => {
    return authorities.find(a => a.name === authorityName) || {
      name: authorityName,
      _key: authorityName.toLowerCase().replace(/\s+/g, '-'),
      role: 'Hiring Manager',
      level: 'Manager',
      hiringPower: 'Medium'
    }
  }

  const filteredMatches = matches.filter(match => {
    if (filterStatus === 'all') return true
    return match.status === filterStatus
  })

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'name':
        return a.jobSeeker.name.localeCompare(b.jobSeeker.name)
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
      // In a real app, this would make an API call to update the match status
      // The key point is that rejection only affects the match status, not the job seeker record
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

      setMatches(prev => prev.map(match =>
        match.id === matchId
          ? {
              ...match,
              status: action,
              updatedAt: new Date(),
              // Add note about what rejection means
              adminNote: action === 'rejected'
                ? 'Admin determined this specific match is not suitable. Job seeker remains in talent pool.'
                : action === 'approved'
                ? 'Admin approved this match for further consideration.'
                : null
            }
          : match
      ))

      // Show success message or handle success state
      console.log(`Match ${matchId} ${action} successfully`)

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

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
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
            <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
            <div className="text-sm text-candid-gray-500">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {matches.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-candid-gray-500">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {matches.filter(m => m.status === 'approved').length}
            </div>
            <div className="text-sm text-candid-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {matches.filter(m => m.status === 'rejected').length}
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
                Showing {sortedMatches.length} of {matches.length} matches
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
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.score)}`}>
                  {match.score}% Match
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
                      {match.jobSeeker.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{match.jobSeeker.name}</h3>
                    <p className="text-gray-600 text-sm">{match.jobSeeker.title}</p>
                  </div>
                </div>
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
              </div>

              {/* Position Info */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="font-medium text-gray-900">{match.position.title}</h4>
                <div className="mb-2">
                  <CompanyLink company={getCompanyByName(match.position.company)} size="sm" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {match.position.requirements.slice(0, 3).map((req, index) => (
                    <SkillLink key={index} skill={getSkillByName(req)} size="xs" />
                  ))}
                  {match.position.requirements.length > 3 && (
                    <span className="badge badge-secondary text-xs">
                      +{match.position.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Hiring Authority Info */}
              {match.hiringAuthority && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Hiring Authority:</h5>
                  <div className="flex items-center justify-between">
                    <div>
                      <AuthorityLink authority={getAuthorityByName(match.hiringAuthority.name)} size="sm">
                        {match.hiringAuthority.name}
                      </AuthorityLink>
                      <p className="text-xs text-gray-600">{match.hiringAuthority.role}</p>
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