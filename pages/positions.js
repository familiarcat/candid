import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DetailModal from '../components/ui/DetailModal'
import { CompanyLink, SkillLink } from '../components/ui/LinkButton'
import { formatDate, getEntityIcon } from '../lib/utils'

export default function Positions() {
  const router = useRouter()
  const [positions, setPositions] = useState([])
  const [companies, setCompanies] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('posted')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch positions, companies, and skills in parallel
        const [positionsRes, companiesRes, skillsRes] = await Promise.all([
          fetch('/api/positions'),
          fetch('/api/companies'),
          fetch('/api/skills')
        ])

        if (positionsRes.ok && companiesRes.ok && skillsRes.ok) {
          const [positionsData, companiesData, skillsData] = await Promise.all([
            positionsRes.json(),
            companiesRes.json(),
            skillsRes.json()
          ])

          setPositions(positionsData.positions || positionsData)
          setCompanies(companiesData.companies || companiesData)
          setSkills(skillsData.skills || skillsData)
        } else {
          // Fallback to sample data
          const samplePositions = [
            {
              id: 'pos_1',
              title: 'Lead Frontend Engineer',
              company: 'TechCorp Inc.',
              companyLogo: '🏢',
              level: 'Senior',
              type: 'Full-time',
              location: 'San Francisco, CA',
              remote: true,
              salary: '$140,000 - $180,000',
              description: 'Lead a team of frontend engineers building next-generation web applications using React and TypeScript.',
              requirements: ['React', 'TypeScript', 'Leadership', 'GraphQL', 'Node.js'],
              benefits: ['Health Insurance', 'Stock Options', 'Remote Work', '401k'],
              postedDate: new Date('2024-01-15'),
              applicants: 23,
              status: 'active'
            },
            {
              id: 'pos_2',
              title: 'Backend Engineer',
              company: 'DataFlow Systems',
              companyLogo: '📊',
              level: 'Mid',
              type: 'Full-time',
              location: 'Austin, TX',
              remote: false,
              salary: '$100,000 - $130,000',
              description: 'Build scalable backend systems for our data analytics platform using Python and Django.',
              requirements: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
              benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
              postedDate: new Date('2024-01-14'),
              applicants: 18,
              status: 'active'
            },
            {
              id: 'pos_3',
              title: 'Senior UX Designer',
              company: 'Design Studio Pro',
              companyLogo: '🎨',
              level: 'Senior',
              type: 'Contract',
              location: 'New York, NY',
              remote: true,
              salary: '$80 - $120/hour',
              description: 'Design intuitive user experiences for our client projects across various industries.',
              requirements: ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
              benefits: ['Flexible Schedule', 'Creative Freedom', 'Portfolio Building'],
              postedDate: new Date('2024-01-13'),
              applicants: 31,
              status: 'active'
            },
            {
              id: 'pos_4',
              title: 'Cloud Infrastructure Engineer',
              company: 'CloudTech Solutions',
              companyLogo: '☁️',
              level: 'Senior',
              type: 'Full-time',
              location: 'Seattle, WA',
              remote: true,
              salary: '$130,000 - $160,000',
              description: 'Design and maintain cloud infrastructure for enterprise clients using Kubernetes and Terraform.',
              requirements: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Monitoring'],
              benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Conference Budget'],
              postedDate: new Date('2024-01-12'),
              applicants: 15,
              status: 'active'
            },
            {
              id: 'pos_5',
              title: 'Junior Frontend Developer',
              company: 'TechCorp Inc.',
              companyLogo: '🏢',
              level: 'Junior',
              type: 'Full-time',
              location: 'San Francisco, CA',
              remote: false,
              salary: '$70,000 - $90,000',
              description: 'Join our frontend team to build user interfaces and learn from experienced developers.',
              requirements: ['JavaScript', 'React', 'CSS', 'Git'],
              benefits: ['Health Insurance', 'Mentorship', 'Learning Budget'],
              postedDate: new Date('2024-01-10'),
              applicants: 42,
              status: 'paused'
            }
          ]
          setPositions(samplePositions)
          setCompanies([]) // Sample companies would go here
          setSkills([]) // Sample skills would go here
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
  const handleViewDetails = (position) => {
    setSelectedPosition(position)
    setShowDetailModal(true)
  }

  const handleFindMatches = (position) => {
    router.push(`/matches?position=${position.id}`)
  }

  const getCompanyByName = (companyName) => {
    return companies.find(c => c.name === companyName) || {
      name: companyName,
      _key: companyName.toLowerCase().replace(/\s+/g, '-'),
      industry: 'Technology',
      employeeCount: 100
    }
  }

  const getSkillByName = (skillName) => {
    return skills.find(s => s.name === skillName) || {
      name: skillName,
      _key: skillName.toLowerCase().replace(/\s+/g, '-'),
      category: 'Technology',
      demand: 'High'
    }
  }

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLevel = filterLevel === 'all' || position.level === filterLevel
    const matchesType = filterType === 'all' || position.type === filterType

    return matchesSearch && matchesLevel && matchesType
  })

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    switch (sortBy) {
      case 'posted':
        return new Date(b.postedDate) - new Date(a.postedDate)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'company':
        return a.company.localeCompare(b.company)
      case 'applicants':
        return b.applicants - a.applicants
      default:
        return 0
    }
  })

  const getLevelColor = (level) => {
    switch (level) {
      case 'Junior': return 'bg-green-100 text-green-800'
      case 'Mid': return 'bg-blue-100 text-blue-800'
      case 'Senior': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Full-time': return 'bg-emerald-100 text-emerald-800'
      case 'Part-time': return 'bg-yellow-100 text-yellow-800'
      case 'Contract': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <title>Positions | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Open Positions</h1>
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
                placeholder="Search positions, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Level:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="posted">Date Posted</option>
                <option value="title">Position Title</option>
                <option value="company">Company</option>
                <option value="applicants">Applicants</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedPositions.length} positions found
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div className="space-y-4">
          {sortedPositions.map((position) => (
            <div key={position.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Position Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{position.companyLogo}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{position.title}</h3>
                    <CompanyLink company={getCompanyByName(position.company)} size="sm" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(position.level)}`}>
                    {position.level}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(position.type)}`}>
                    {position.type}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(position.status)}`}>
                    {position.status}
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  {position.location} {position.remote && '(Remote OK)'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">💰</span>
                  {position.salary}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👥</span>
                  {position.applicants} applicants
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4">
                {position.description}
              </p>

              {/* Requirements */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h5>
                <div className="flex flex-wrap gap-2">
                  {position.requirements.map((req, index) => (
                    <SkillLink key={index} skill={getSkillByName(req)} size="xs" />
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                <div className="flex flex-wrap gap-1">
                  {position.benefits.map((benefit, index) => (
                    <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Posted {formatDate(position.postedDate)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(position)}
                    className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleFindMatches(position)}
                    className="border border-primary-600 text-primary-600 px-4 py-2 rounded text-sm hover:bg-primary-50 transition-colors"
                  >
                    Find Matches
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPositions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        entity={selectedPosition}
        entityType="position"
        onFindMatches={handleFindMatches}
      />
    </Layout>
  )
}
