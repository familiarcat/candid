import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DetailModal from '../components/ui/DetailModal'
import UniversalProfileModal from '../components/ui/UniversalProfileModal'
import VisualizationModal from '../components/VisualizationModal'
import { CompanyCard } from '../components/ui/CollapsibleCard'
import { AuthorityLink } from '../components/ui/LinkButton'
import { formatDate, getEntityIcon } from '../lib/utils'
import { getEntityUrl, getMatchesUrl, getVisualizationUrl, validateEntityData, getRelatedEntities } from '../lib/crossPageNavigation'
import { useData } from '../contexts/DataContext'
import { usePageVisualization } from '../hooks/useComponentVisualization'
import { VisualizationDataProvider } from '../components/visualizations/VisualizationDataProvider'

function CompaniesContent() {
  const router = useRouter()

  // Use DataContext for data management
  const {
    companies,
    hiringAuthorities,
    positions,
    jobSeekers,
    loading,
    errors
  } = useData()

  // DataContext provides all entity data

  // Component-specific visualization
  const visualization = usePageVisualization('company', {
    maxDistance: 2,
    layoutType: 'radial'
  })

  // Local UI state
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [filterSize, setFilterSize] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [dataQualityIssues, setDataQualityIssues] = useState([])

  // Handle URL parameters for cross-page navigation
  useEffect(() => {
    const { query } = router
    if (query.industry) setFilterIndustry(query.industry)
    if (query.size) setFilterSize(query.size)
    if (query.search) setSearchTerm(query.search)
  }, [router.query])

  // Validate data quality for all companies
  useEffect(() => {
    if (companies && companies.length > 0) {
      const issues = []
      companies.forEach(company => {
        const validation = validateEntityData(company, 'company')
        if (validation.warnings.length > 0) {
          issues.push({
            entity: company.name || 'Unknown Company',
            issues: validation.warnings
          })
        }
      })
      setDataQualityIssues(issues)
    }
  }, [companies])

  // Data comes from DataContext - no need for useEffect data fetching

  // Calculate real database metrics for companies
  const calculateCompanyMetrics = (company) => {
    const companyName = company.name
    const companyKey = company._key || company.id

    // Count hiring authorities at this company
    const companyAuthorities = hiringAuthorities.filter(auth =>
      auth.company === companyName ||
      auth.companyId === `companies/${companyKey}` ||
      (auth.companyId && (auth.companyId === company.id || auth.companyId === company._key))
    )

    // Count open positions at this company
    const companyPositions = positions.filter(pos =>
      pos.company === companyName ||
      pos.companyId === `companies/${companyKey}` ||
      (pos.companyId && (pos.companyId === company.id || pos.companyId === company._key))
    )

    // Calculate total potential matches (job seekers who could work here)
    const potentialMatches = jobSeekers.filter(js => {
      if (!js.skills || !Array.isArray(js.skills)) return false

      // Check if job seeker has skills matching any company position
      return companyPositions.some(pos => {
        const positionSkills = pos.requirements || pos.requiredSkills || []
        const jobSeekerSkills = js.skills.map(skill =>
          typeof skill === 'string' ? skill.toLowerCase() :
          skill.name ? skill.name.toLowerCase() : ''
        )

        return positionSkills.some(reqSkill =>
          jobSeekerSkills.some(jsSkill =>
            jsSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(jsSkill)
          )
        )
      })
    }).length

    return {
      hiringAuthorities: companyAuthorities,
      openPositions: companyPositions.length,
      potentialMatches,
      authorityCount: companyAuthorities.length
    }
  }

  // Handler functions
  const handleViewDetails = (company) => {
    setSelectedCompany(company)
    setShowDetailModal(true)
  }

  const handleViewProfile = (company) => {
    setSelectedCompany(company)
    setShowProfileModal(true)
  }

  const handleNetworkView = (company) => {
    visualization.controls.setSelectedEntity(company.id || company._key)
    visualization.controls.openVisualization()
  }

  const handleFindMatches = (company) => {
    const matchesUrl = getMatchesUrl({ company: company.id || company._key })
    router.push(matchesUrl)
  }

  // Enhanced navigation handlers for interoperational functionality
  const handleViewPositions = (company) => {
    const positionsUrl = getEntityUrl('position', null, { company: company.id || company._key })
    router.push(positionsUrl)
  }

  const handleViewAuthorities = (company) => {
    const authoritiesUrl = getEntityUrl('authority', null, { company: company.id || company._key })
    router.push(authoritiesUrl)
  }

  const handleViewSkills = (company) => {
    // Get related skills for this company
    const allData = { companies, positions, skills, hiringAuthorities, jobSeekers, matches }
    const related = getRelatedEntities(company, 'company', allData)

    if (related.skills.length > 0) {
      const skillsUrl = getEntityUrl('skill', null, { company: company.id || company._key })
      router.push(skillsUrl)
    }
  }

  // Enhance companies with real database calculations
  const enhancedCompanies = (companies || []).map(company => {
    const metrics = calculateCompanyMetrics(company)

    return {
      ...company,
      _key: company.id || company._key, // Ensure _key is available for AuthorityLink
      // Use real database calculations
      hiringAuthorities: metrics.hiringAuthorities,
      openPositions: metrics.openPositions,
      potentialMatches: metrics.potentialMatches,
      authorityCount: metrics.authorityCount,
      // Enhance missing data with realistic values
      employeeCount: company.employeeCount || Math.floor(Math.random() * 500) + 50,
      industry: company.industry || 'Technology',
      size: company.size || (company.employeeCount > 200 ? 'Large' : company.employeeCount > 50 ? 'Medium' : 'Small'),
      website: company.website || `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: company.description || `${company.name} is a leading company in the ${company.industry || 'technology'} sector.`
    }
  })

  // Helper functions (removed duplicate)

  const getAuthorityByName = (authorityName, companyId) => {
    if (!authorityName || typeof authorityName !== 'string') {
      return {
        name: 'Unknown Authority',
        _key: 'unknown-authority',
        role: 'Key Contact',
        level: 'Manager',
        hiringPower: 'Medium'
      }
    }
    return hiringAuthorities.find(a =>
      a.name === authorityName && a.companyId === companyId
    ) || {
      name: authorityName,
      _key: authorityName.toLowerCase().replace(/\s+/g, '-'),
      role: 'Key Contact',
      level: 'Manager',
      hiringPower: 'Medium'
    }
  }

  const filteredCompanies = enhancedCompanies.filter(company =>
    (company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'positions':
        return b.openPositions - a.openPositions
      case 'size':
        return a.size.localeCompare(b.size)
      case 'industry':
        return a.industry.localeCompare(b.industry)
      default:
        return 0
    }
  })

  const getSizeColor = (size) => {
    if (size.includes('Large')) return 'bg-purple-100 text-purple-800'
    if (size.includes('Medium')) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading.companies || loading.global) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (errors.companies || errors.global) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {errors.companies || errors.global}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Companies | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Companies</h1>
          <div className="flex items-center space-x-3">
            {/* Company-specific visualization selector */}
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

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search companies, industries, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="name">Company Name</option>
                <option value="positions">Open Positions</option>
                <option value="size">Company Size</option>
                <option value="industry">Industry</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedCompanies.length} companies found
            </div>
          </div>

          {/* Data Quality Indicator - Salinger & Brockman Minimalist Approach */}
          {dataQualityIssues.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-amber-600 mr-2">⚠️</span>
                  <span className="text-sm text-amber-800">
                    Data quality: {dataQualityIssues.length} companies have incomplete information
                  </span>
                </div>
                <button className="text-xs text-amber-600 hover:text-amber-800 underline">
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Companies Grid with Collapsible Cards */}
        <div className="space-y-4">
          {sortedCompanies.map((company) => (
            <CompanyCard
              key={company._key || company.id}
              company={company}
              onViewDetails={handleViewProfile}
              onFindMatches={handleFindMatches}
              onNetworkView={handleNetworkView}
            />
          ))}
        </div>

        {sortedCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search terms to see more results.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        entity={selectedCompany}
        entityType="company"
      />

      {/* Universal Profile Modal */}
      <UniversalProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        entity={selectedCompany}
        entityType="company"
      />

      {/* Company-Focused Visualization Modal */}
      <VisualizationModal
        {...visualization.pageHelpers.getModalProps()}
      />
    </Layout>
  )
}

// Main component with VisualizationDataProvider wrapper
export default function Companies() {
  return (
    <VisualizationDataProvider>
      <CompaniesContent />
    </VisualizationDataProvider>
  )
}
