import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DetailModal from '../components/ui/DetailModal'
import { AuthorityLink } from '../components/ui/LinkButton'
import { CompanyCard } from '../components/ui/CollapsibleCard'
import { formatDate, getEntityIcon } from '../lib/utils'

export default function Companies() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [hiringAuthorities, setHiringAuthorities] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies, authorities, and positions in parallel
        const [companiesRes, authoritiesRes, positionsRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/hiring-authorities'),
          fetch('/api/positions')
        ])

        if (companiesRes.ok && authoritiesRes.ok && positionsRes.ok) {
          const [companiesData, authoritiesData, positionsData] = await Promise.all([
            companiesRes.json(),
            authoritiesRes.json(),
            positionsRes.json()
          ])

          const companies = companiesData.companies || companiesData
          const authorities = authoritiesData.authorities || authoritiesData
          const positions = positionsData.positions || positionsData

          // Enhance companies with real data
          const enhancedCompanies = companies.map(company => ({
            ...company,
            openPositions: positions.filter(p => p.companyId === `companies/${company._key}`).length,
            hiringAuthorities: authorities.filter(a => a.companyId === `companies/${company._key}`)
          }))

          setCompanies(enhancedCompanies)
          setHiringAuthorities(authorities)
          setPositions(positions)
        } else {
          // Fallback to sample data
          const sampleCompanies = [
            {
              id: 'company_1',
              name: 'TechCorp Inc.',
              industry: 'Technology',
              size: 'Large (1000+ employees)',
              location: 'San Francisco, CA',
              description: 'Leading technology company specializing in cloud solutions and enterprise software.',
              openPositions: 12,
              hiringAuthorities: [
                { name: 'Sarah Wilson', role: 'VP Engineering' },
                { name: 'Mike Chen', role: 'Director of Product' }
              ],
              founded: '2010',
              website: 'https://techcorp.com',
              logo: '🏢'
            },
            {
              id: 'company_2',
              name: 'DataFlow Systems',
              industry: 'Data Analytics',
              size: 'Medium (100-999 employees)',
              location: 'Austin, TX',
              description: 'Data analytics platform helping businesses make data-driven decisions.',
              openPositions: 8,
              hiringAuthorities: [
                { name: 'Jennifer Rodriguez', role: 'Head of Engineering' },
                { name: 'David Park', role: 'CTO' }
              ],
              founded: '2015',
              website: 'https://dataflow.com',
              logo: '📊'
            },
            {
              id: 'company_3',
              name: 'Design Studio Pro',
              industry: 'Design & Creative',
              size: 'Small (10-99 employees)',
              location: 'New York, NY',
              description: 'Creative design studio specializing in user experience and brand design.',
              openPositions: 5,
              hiringAuthorities: [
                { name: 'Alex Thompson', role: 'Creative Director' },
                { name: 'Maria Garcia', role: 'Design Lead' }
              ],
              founded: '2018',
              website: 'https://designstudiopro.com',
              logo: '🎨'
            },
            {
              id: 'company_4',
              name: 'CloudTech Solutions',
              industry: 'Cloud Infrastructure',
              size: 'Medium (100-999 employees)',
              location: 'Seattle, WA',
              description: 'Cloud infrastructure and DevOps solutions for modern enterprises.',
              openPositions: 15,
              hiringAuthorities: [
                { name: 'Robert Kim', role: 'VP of Engineering' },
                { name: 'Lisa Chang', role: 'Director of Operations' }
              ],
              founded: '2012',
              website: 'https://cloudtech.com',
              logo: '☁️'
            }
          ]
          setCompanies(sampleCompanies)
          setHiringAuthorities([])
          setPositions([])
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
  const handleViewDetails = (company) => {
    setSelectedCompany(company)
    setShowDetailModal(true)
  }

  const getAuthorityByName = (authorityName, companyId) => {
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

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
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
        <title>Companies | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Companies</h1>
          <button
            onClick={() => router.push('/visualizations')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            📊 Visualize
          </button>
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
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedCompanies.map((company) => (
            <div key={company._key || company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{company.logo || '🏢'}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                    <p className="text-gray-600 text-sm">{company.industry}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(company.size || `${company.employeeCount} employees`)}`}>
                  {company.size || `${company.employeeCount} employees`}
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  {company.location || 'Location not specified'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📅</span>
                  Founded {company.founded || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">💼</span>
                  {company.openPositions || 0} open positions
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {company.description || `${company.name} is a ${company.industry} company.`}
              </p>

              {/* Hiring Authorities */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Key Contacts:</h5>
                <div className="space-y-2">
                  {(company.hiringAuthorities || []).slice(0, 3).map((authority, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">👤</span>
                        <span className="font-medium">{authority.name}</span>
                        <span className="mx-2">•</span>
                        <span>{authority.role}</span>
                      </div>
                      <AuthorityLink
                        authority={getAuthorityByName(authority.name, `companies/${company._key}`)}
                        size="xs"
                      >
                        View Profile
                      </AuthorityLink>
                    </div>
                  ))}
                  {(company.hiringAuthorities || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic">No key contacts available</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 text-sm hover:text-primary-700 transition-colors"
                  >
                    Visit Website →
                  </a>
                )}
                <button
                  onClick={() => handleViewDetails(company)}
                  className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
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
    </Layout>
  )
}
