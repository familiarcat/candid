import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import VisualizationModal from '../components/VisualizationModal'
import { generateSampleGraphData } from '../lib/graphData'
import { getMatchColor, formatDate } from '../lib/utils'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showVisualization, setShowVisualization] = useState(false)
  const [graphData, setGraphData] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Simulate API call - in real app this would fetch from /api/matches
        setTimeout(() => {
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
          setGraphData(generateSampleGraphData())
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

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

  const handleMatchAction = (matchId, action) => {
    setMatches(prev => prev.map(match =>
      match.id === matchId
        ? { ...match, status: action }
        : match
    ))
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
        <title>Authority Matches | Candid Connections Katra</title>
        <meta name="description" content="Job seeker to hiring authority matches based on graph database connections and company hierarchy." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-secondary-800">Authority Matches</h1>
            <p className="text-candid-gray-600 mt-2">Job seekers connected to the right hiring authorities</p>
          </div>
          <button
            onClick={() => setShowVisualization(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            🌐 View Network
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="score">Match Score</option>
                <option value="date">Date Created</option>
                <option value="name">Job Seeker Name</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {sortedMatches.length} matches found
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
                <h3 className="font-semibold text-lg text-gray-900">{match.jobSeeker.name}</h3>
                <p className="text-gray-600 text-sm">{match.jobSeeker.title}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.jobSeeker.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {match.jobSeeker.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{match.jobSeeker.skills.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Position Info */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="font-medium text-gray-900">{match.position.title}</h4>
                <p className="text-gray-600 text-sm">{match.position.company}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.position.requirements.slice(0, 3).map((req, index) => (
                    <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                      {req}
                    </span>
                  ))}
                  {match.position.requirements.length > 3 && (
                    <span className="text-xs text-gray-500">+{match.position.requirements.length - 3} more</span>
                  )}
                </div>
              </div>

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

              {/* Actions */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created {formatDate(match.createdAt)}
                </span>

                {match.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMatchAction(match.id, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleMatchAction(match.id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Visualization Modal */}
      <VisualizationModal
        isOpen={showVisualization}
        onClose={() => setShowVisualization(false)}
        data={graphData}
        title="Job Matches Network"
      />
    </Layout>
  )
}