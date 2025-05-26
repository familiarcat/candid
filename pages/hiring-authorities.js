import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import VisualizationModal from '../components/VisualizationModal'
import { CompanyLink, SkillLink } from '../components/ui/LinkButton'
import { useData } from '../contexts/DataContext'
import { usePageVisualization } from '../hooks/useComponentVisualization'
import { VisualizationDataProvider } from '../components/visualizations/VisualizationDataProvider'

function HiringAuthoritiesContent() {
  const router = useRouter()
  const { hiringAuthorities, companies, skills, loading } = useData()

  // Component-specific visualization
  const visualization = usePageVisualization('authority', {
    maxDistance: 2,
    layoutType: 'radial'
  })

  const [filters, setFilters] = useState({
    role: '',
    companySize: '',
    industry: ''
  })

  // Data comes from DataContext - no need for useEffect

  // Helper functions
  const getCompanyByName = (companyName) => {
    if (!companyName || typeof companyName !== 'string') return null
    return companies.find(c => c.name === companyName) || {
      name: companyName,
      _key: companyName.toLowerCase().replace(/\s+/g, '-'),
      industry: 'Technology',
      employeeCount: 100
    }
  }

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

  const getHiringPowerColor = (power) => {
    switch (power) {
      case 'Ultimate': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompanySizeColor = (size) => {
    if (size === 'Startup') return 'bg-green-100 text-green-800'
    if (size === 'Mid-size') return 'bg-blue-100 text-blue-800'
    if (size === 'Enterprise') return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const filteredAuthorities = hiringAuthorities.filter(auth => {
    return (
      (filters.role === '' || auth.level.toLowerCase().includes(filters.role.toLowerCase())) &&
      (filters.companySize === '' || auth.company?.size === filters.companySize) &&
      (filters.industry === '' || auth.company?.industry.toLowerCase().includes(filters.industry.toLowerCase()))
    )
  })

  return (
    <Layout>
      <Head>
        <title>Hiring Authorities | Candid Connections Katra</title>
        <meta name="description" content="Connect with the right hiring authorities based on company hierarchy and decision-making power." />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-secondary-800 mb-4">
              Hiring Authorities
            </h1>
            <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
              Connect directly with decision makers. Our graph database maps company hierarchies to identify the right hiring authority for your skills and experience level.
            </p>
          </div>
          <div className="flex items-center space-x-3 ml-6">
            {/* Authority-specific visualization selector */}
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

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Filter Authorities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Authority Level</label>
                <select
                  className="form-input"
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                >
                  <option value="">All Levels</option>
                  <option value="C-Suite">C-Suite</option>
                  <option value="Executive">Executive</option>
                  <option value="Director">Director</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="form-label">Company Size</label>
                <select
                  className="form-input"
                  value={filters.companySize}
                  onChange={(e) => setFilters({...filters, companySize: e.target.value})}
                >
                  <option value="">All Sizes</option>
                  <option value="Startup">Startup (&lt;100)</option>
                  <option value="Mid-size">Mid-size (100-1000)</option>
                  <option value="Enterprise">Enterprise (1000+)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Industry</label>
                <select
                  className="form-input"
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="FinTech">FinTech</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Authorities Grid */}
        {loading.global || loading.hiringAuthorities ? (
          <div className="text-center py-12">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-candid-gray-600">Loading hiring authorities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthorities.map((authority) => (
              <div key={authority.id} className="card-interactive">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{authority.avatar || '👔'}</div>
                      <div>
                        <h3 className="font-semibold text-secondary-800">{authority.name}</h3>
                        <p className="text-sm text-candid-gray-600">{authority.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">{authority.level}</div>
                      <div className="text-xs text-candid-gray-500">Authority Level</div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mb-4">
                    <div className="mb-2">
                      <CompanyLink company={authority.company} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getCompanySizeColor(authority.company?.size)}`}>
                        {authority.company?.size}
                      </span>
                      <span className={`badge ${getHiringPowerColor(authority.hiringPower)}`}>
                        {authority.hiringPower} Power
                      </span>
                      {authority.decisionMaker && (
                        <span className="badge bg-green-100 text-green-800">Decision Maker</span>
                      )}
                    </div>
                  </div>

                  {/* Skills Looking For */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-secondary-700 mb-2">Looking for:</p>
                    <div className="flex flex-wrap gap-2">
                      {(authority.skillsLookingFor || []).slice(0, 3).map((skill, index) => (
                        <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                      ))}
                      {(authority.skillsLookingFor || []).length > 3 && (
                        <span className="badge badge-secondary text-xs">
                          +{(authority.skillsLookingFor || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-candid-gray-600 mb-4">
                    <span>{authority.activePositions || 0} open positions</span>
                    <span>{authority.preferredExperience || 'N/A'} exp.</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/hiring-authorities/${authority.id || authority._key}`}
                      className="btn-primary text-sm py-2 px-4 flex-1 text-center"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        visualization.controls.setSelectedEntity(authority.id || authority._key)
                        visualization.controls.openVisualization()
                      }}
                      className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      🌐 Network
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAuthorities.length === 0 && !loading.global && !loading.hiringAuthorities && (
          <div className="text-center py-12">
            <p className="text-candid-gray-600">No hiring authorities match your current filters.</p>
          </div>
        )}

        {/* Authority-Focused Visualization Modal */}
        <VisualizationModal
          {...visualization.pageHelpers.getModalProps()}
        />
      </div>
    </Layout>
  )
}

// Main component with VisualizationDataProvider wrapper
export default function HiringAuthorities() {
  return (
    <VisualizationDataProvider>
      <HiringAuthoritiesContent />
    </VisualizationDataProvider>
  )
}
