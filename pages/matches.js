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
          // No fallback data - ensure database is seeded
          console.warn('No matches data found - database may need seeding')
          setMatches([])
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
    if (!companyName) return null
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

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getHiringPowerColor = (power) => {
    switch (power) {
      case 'Ultimate': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchesSearch =
      match.jobSeeker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.hiringAuthority?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.hiringAuthority?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.jobSeeker?.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLevel = filterLevel === 'all' || match.hiringAuthority?.level === filterLevel
    const matchesScore = match.matchScore >= minScore

    return matchesSearch && matchesLevel && matchesScore
  })

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.matchScore - a.matchScore
      case 'authority':
        return (a.hiringAuthority?.name || '').localeCompare(b.hiringAuthority?.name || '')
      case 'jobSeeker':
        return (a.jobSeeker?.name || '').localeCompare(b.jobSeeker?.name || '')
      case 'company':
        return (a.hiringAuthority?.company || '').localeCompare(b.hiringAuthority?.company || '')
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
        <title>Authority Matches | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Authority Matches</h1>
          <button
            onClick={() => router.push('/visualizations')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            📊 Visualize
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search job seekers, authorities, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Authority Level:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="C-Suite">C-Suite</option>
                <option value="Executive">Executive</option>
                <option value="Director">Director</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Min Score:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-8">{minScore}%</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="score">Match Score</option>
                <option value="authority">Authority Name</option>
                <option value="jobSeeker">Job Seeker Name</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedMatches.length} matches found
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-4">
          {sortedMatches.map((match) => (
            <div key={match.id || `${match.jobSeeker?.id}-${match.hiringAuthority?.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Match Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}% Match
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.matchType || 'Authority Match'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {match.createdAt ? new Date(match.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Seeker Side */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">👤</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{match.jobSeeker?.name || 'Job Seeker'}</h3>
                      <p className="text-sm text-gray-600">{match.jobSeeker?.title || 'Professional'}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Experience:</span> {match.jobSeeker?.experience || 'N/A'}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {(match.jobSeeker?.skills || []).slice(0, 4).map((skill, index) => (
                        <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                      ))}
                      {(match.jobSeeker?.skills || []).length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{(match.jobSeeker?.skills || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hiring Authority Side */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">👔</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{match.hiringAuthority?.name || 'Hiring Authority'}</h3>
                      <p className="text-sm text-gray-600">{match.hiringAuthority?.role || 'Hiring Manager'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CompanyLink company={getCompanyByName(match.hiringAuthority?.company)} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHiringPowerColor(match.hiringAuthority?.hiringPower)}`}>
                      {match.hiringAuthority?.hiringPower || 'Medium'} Power
                    </span>
                    {match.hiringAuthority?.decisionMaker && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Decision Maker
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Open Positions:</span> {match.hiringAuthority?.activePositions || 0}
                  </div>
                </div>
              </div>

              {/* Match Details */}
              {match.matchReasons && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Match Reasons:</p>
                  <div className="flex flex-wrap gap-2">
                    {match.matchReasons.map((reason, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                <div className="flex space-x-2">
                  <AuthorityLink
                    authority={{
                      ...match.hiringAuthority,
                      _key: match.hiringAuthority?.id || match.hiringAuthority?._key
                    }}
                    size="sm"
                  >
                    View Authority
                  </AuthorityLink>
                </div>
                <div className="text-sm text-gray-500">
                  Match confidence: {match.confidence || 'High'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters to see more results.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}