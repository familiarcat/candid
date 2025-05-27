import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import UniversalProfileModal from '../components/ui/UniversalProfileModal'
import VisualizationModal from '../components/VisualizationModal'
import { SkillLink, CompanyLink } from '../components/ui/LinkButton'
import { CollapsibleCard } from '../components/ui/CollapsibleCard'
import AuthorityNetworkGraph from '../components/visualizations/AuthorityNetworkGraph'
import { transformToNetworkData } from '../lib/visualizationData'
import { getEntityUrl, getMatchesUrl, getVisualizationUrl, validateEntityData, getRelatedEntities } from '../lib/crossPageNavigation'
import { useData } from '../contexts/DataContext'
import { usePageVisualization } from '../hooks/useComponentVisualization'
import { VisualizationDataProvider } from '../components/visualizations/VisualizationDataProvider'

function JobSeekersContent() {
  const router = useRouter()

  // Use DataContext for data management
  const {
    jobSeekers,
    companies,
    skills,
    hiringAuthorities,
    matches,
    loading,
    errors
  } = useData()

  // Component-specific visualization
  const visualization = usePageVisualization('jobSeeker', {
    maxDistance: 2,
    layoutType: 'radial'
  })

  // Local UI state
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] })
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null)
  const [showNetworkFocus, setShowNetworkFocus] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [dataQualityIssues, setDataQualityIssues] = useState([])

  // Handle URL parameters for cross-page navigation
  useEffect(() => {
    const { query } = router
    if (query.skill) setSkillFilter(query.skill)
    if (query.position) {
      setSearchTerm(query.position)
    }
    if (query.company) {
      setSearchTerm(query.company)
    }
    if (query.experience) setExperienceFilter(query.experience)
    if (query.location) setLocationFilter(query.location)
    if (query.search) setSearchTerm(query.search)
  }, [router.query])

  // Validate data quality for all job seekers
  useEffect(() => {
    if (jobSeekers && jobSeekers.length > 0) {
      const issues = []
      jobSeekers.forEach(jobSeeker => {
        const validation = validateEntityData(jobSeeker, 'jobSeeker')
        if (validation.warnings.length > 0) {
          issues.push({
            entity: jobSeeker.name || 'Unknown Job Seeker',
            issues: validation.warnings
          })
        }
      })
      setDataQualityIssues(issues)
    }
  }, [jobSeekers])

  // Update network data when data changes
  useEffect(() => {
    if (companies.length > 0 && hiringAuthorities.length > 0 && jobSeekers.length > 0 && skills.length > 0) {
      const networkData = transformToNetworkData(companies, hiringAuthorities, jobSeekers, skills, matches)
      setNetworkData(networkData)
    }
  }, [companies, hiringAuthorities, jobSeekers, skills, matches])

  // Check for skill filter from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const skillParam = urlParams.get('skill')
    if (skillParam) {
      setSkillFilter(skillParam)
    }
  }, [])

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

  const handleJobSeekerSelect = (jobSeeker) => {
    setSelectedJobSeeker(jobSeeker)
    setShowProfileModal(true)
  }

  const handleNetworkFocus = (jobSeeker) => {
    // Focus the network visualization on the selected job seeker
    const focusedNetworkData = {
      ...networkData,
      focusNodeId: jobSeeker._key
    }
    setNetworkData(focusedNetworkData)
    setShowNetworkFocus(true)
  }

  // Enhanced navigation handlers for interoperational functionality
  const handleViewSkills = (jobSeeker) => {
    if (jobSeeker.skills && jobSeeker.skills.length > 0) {
      const skillsUrl = getEntityUrl('skill', null, { jobSeeker: jobSeeker.id || jobSeeker._key })
      router.push(skillsUrl)
    }
  }

  const handleFindMatches = (jobSeeker) => {
    const matchesUrl = getMatchesUrl({ jobSeeker: jobSeeker.id || jobSeeker._key })
    router.push(matchesUrl)
  }

  const handleViewPositions = (jobSeeker) => {
    // Get related positions for this job seeker
    const allData = { companies, positions, skills, jobSeekers, matches }
    const related = getRelatedEntities(jobSeeker, 'jobSeeker', allData)

    if (related.positions.length > 0) {
      const positionsUrl = getEntityUrl('position', null, { jobSeeker: jobSeeker.id || jobSeeker._key })
      router.push(positionsUrl)
    }
  }

  // Filtering logic
  const filteredJobSeekers = jobSeekers.filter(jobSeeker => {
    const matchesSearch = !searchTerm ||
      (jobSeeker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (jobSeeker.title || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSkill = !skillFilter ||
      (jobSeeker.skills && jobSeeker.skills.some(skill =>
        (skill || '').toLowerCase().includes(skillFilter.toLowerCase())
      ))

    const matchesExperience = !experienceFilter ||
      jobSeeker.experience === experienceFilter

    const matchesLocation = !locationFilter ||
      (jobSeeker.location && jobSeeker.location.toLowerCase().includes(locationFilter.toLowerCase()))

    return matchesSearch && matchesSkill && matchesExperience && matchesLocation
  })

  const uniqueSkills = [...new Set(jobSeekers.flatMap(js => js.skills || []))]
  const uniqueExperience = [...new Set(jobSeekers.map(js => js.experience).filter(Boolean))]
  const uniqueLocations = [...new Set(jobSeekers.map(js => js.location).filter(Boolean))]

  return (
    <Layout>
      <Head>
        <title>Job Seekers | Candid Connections Katra</title>
        <meta name="description" content="Browse and filter job seekers with network visualization focus." />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-secondary-800 mb-4">
              Job Seekers
            </h1>
            <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
              Discover talented professionals and explore their connections within the hiring authority network.
            </p>
          </div>
          <div className="flex items-center space-x-3 ml-6">
            {/* Job Seeker-specific visualization selector */}
            {visualization.hasData && (
              <div className="flex items-center space-x-2">
                {visualization.pageHelpers.renderEntitySelector('text-sm')}
                {visualization.pageHelpers.renderVisualizationButton('text-sm px-3 py-2')}
              </div>
            )}
            <button
              onClick={() => router.push('/visualizations')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              📊 Global View
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{jobSeekers.length}</div>
            <div className="text-sm text-candid-gray-500">Total Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredJobSeekers.length}</div>
            <div className="text-sm text-candid-gray-500">Filtered Results</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{uniqueSkills.length}</div>
            <div className="text-sm text-candid-gray-500">Unique Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{uniqueLocations.length}</div>
            <div className="text-sm text-candid-gray-500">Locations</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Filter Job Seekers</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Name or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Skills</option>
                  {uniqueSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  {uniqueExperience.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || skillFilter || experienceFilter || locationFilter) && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {filteredJobSeekers.length} of {jobSeekers.length} job seekers
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSkillFilter('')
                    setExperienceFilter('')
                    setLocationFilter('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Data Quality Indicator - Salinger & Brockman Minimalist Approach */}
            {dataQualityIssues.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-amber-600 mr-2">⚠️</span>
                    <span className="text-sm text-amber-800">
                      Data quality: {dataQualityIssues.length} job seekers have incomplete information
                    </span>
                  </div>
                  <button className="text-xs text-amber-600 hover:text-amber-800 underline">
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading and Error States */}
        {(loading.jobSeekers || loading.global) && (
          <div className="text-center py-12">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-candid-gray-600">Loading job seekers...</p>
          </div>
        )}

        {(errors.jobSeekers || errors.global) && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-red-600">Error: {errors.jobSeekers || errors.global}</p>
          </div>
        )}

        {/* Job Seekers Grid */}
        {!loading.jobSeekers && !loading.global && !errors.jobSeekers && !errors.global && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobSeekers.map((jobSeeker) => (
              <div key={jobSeeker._key} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-semibold text-lg">
                          {jobSeeker.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{jobSeeker.name}</h3>
                        <p className="text-gray-600">{jobSeeker.title}</p>
                      </div>
                    </div>
                    <span className={`badge ${
                      jobSeeker.experience === 'Senior' ? 'bg-purple-100 text-purple-800' :
                      jobSeeker.experience === 'Mid-level' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {jobSeeker.experience || 'Entry-level'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    {jobSeeker.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        {jobSeeker.location}
                      </div>
                    )}
                    {jobSeeker.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">✉️</span>
                        {jobSeeker.email}
                      </div>
                    )}
                    {jobSeeker.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📞</span>
                        {jobSeeker.phone}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Skills:</h5>
                      <div className="flex flex-wrap gap-2">
                        {jobSeeker.skills.slice(0, 4).map((skill, index) => (
                          <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                        ))}
                        {jobSeeker.skills.length > 4 && (
                          <span className="badge badge-secondary text-xs">
                            +{jobSeeker.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleJobSeekerSelect(jobSeeker)}
                      className="btn-primary text-sm px-4 py-2 flex-1"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        visualization.controls.setSelectedEntity(jobSeeker.id || jobSeeker._key)
                        visualization.controls.openVisualization()
                      }}
                      className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      🌐 Network
                    </button>
                    <button
                      onClick={() => handleNetworkFocus(jobSeeker)}
                      className="btn-outline text-sm px-3 py-2"
                    >
                      Focus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Network Visualization */}
        {showNetworkFocus && selectedJobSeeker && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-secondary-800">
                  Network Focus: {selectedJobSeeker.name}
                </h3>
                <button
                  onClick={() => setShowNetworkFocus(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <AuthorityNetworkGraph
                  data={networkData}
                  width={800}
                  height={500}
                  focusNodeId={selectedJobSeeker._key}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading.jobSeekers && !loading.global && !errors.jobSeekers && !errors.global && filteredJobSeekers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No job seekers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find more candidates.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSkillFilter('')
                setExperienceFilter('')
                setLocationFilter('')
              }}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Universal Profile Modal */}
        <UniversalProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          entity={selectedJobSeeker}
          entityType="jobSeeker"
        />

        {/* Job Seeker-Focused Visualization Modal */}
        <VisualizationModal
          {...visualization.pageHelpers.getModalProps()}
        />
      </div>
    </Layout>
  )
}

// Main component with VisualizationDataProvider wrapper
export default function JobSeekers() {
  return (
    <VisualizationDataProvider>
      <JobSeekersContent />
    </VisualizationDataProvider>
  )
}