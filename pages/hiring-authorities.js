import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { CompanyLink, SkillLink } from '../components/ui/LinkButton'

export default function HiringAuthorities() {
  const router = useRouter()
  const [authorities, setAuthorities] = useState([])
  const [companies, setCompanies] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: '',
    companySize: '',
    industry: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch authorities, companies, and skills in parallel
        const [authoritiesRes, companiesRes, skillsRes] = await Promise.all([
          fetch('/api/hiring-authorities'),
          fetch('/api/companies'),
          fetch('/api/skills')
        ])

        if (authoritiesRes.ok && companiesRes.ok && skillsRes.ok) {
          const [authoritiesData, companiesData, skillsData] = await Promise.all([
            authoritiesRes.json(),
            companiesRes.json(),
            skillsRes.json()
          ])

          setAuthorities(authoritiesData.authorities || authoritiesData)
          setCompanies(companiesData.companies || companiesData)
          setSkills(skillsData.skills || skillsData)
        } else {
          // Fallback to sample data
          const sampleAuthorities = [
            {
              id: 'auth_1',
              name: 'Sarah Wilson',
              role: 'VP Engineering',
              level: 'Executive',
              company: 'TechCorp Inc.',
              companySize: 'Enterprise (1000+)',
              industry: 'Technology',
              email: 'sarah.wilson@techcorp.com',
              hiringPower: 'High',
              activePositions: 5,
              skillsLookingFor: ['React', 'Node.js', 'Python', 'AWS', 'Leadership'],
              preferredExperience: '5-10 years',
              decisionMaker: true,
              avatar: '👩‍💼',
              connectionStrength: 92
            },
            {
              id: 'auth_2',
              name: 'Mike Chen',
              role: 'Director of Product',
              level: 'Director',
              company: 'TechCorp Inc.',
              companySize: 'Enterprise (1000+)',
              industry: 'Technology',
              email: 'mike.chen@techcorp.com',
              hiringPower: 'Medium',
              activePositions: 3,
              skillsLookingFor: ['Product Management', 'UX/UI', 'Analytics', 'Agile'],
              preferredExperience: '3-7 years',
              decisionMaker: false,
              avatar: '👨‍💼',
              connectionStrength: 87
            },
            {
              id: 'auth_3',
              name: 'Jennifer Rodriguez',
              role: 'CEO',
              level: 'C-Suite',
              company: 'StartupFlow',
              companySize: 'Startup (<100)',
              industry: 'FinTech',
              email: 'jen@startupflow.com',
              hiringPower: 'Ultimate',
              activePositions: 8,
              skillsLookingFor: ['Full Stack', 'Blockchain', 'Finance', 'Startup Experience'],
              preferredExperience: '2-8 years',
              decisionMaker: true,
              avatar: '👩‍💼',
              connectionStrength: 95
            },
            {
              id: 'auth_4',
              name: 'David Park',
              role: 'HR Director',
              level: 'Director',
              company: 'MegaCorp Industries',
              companySize: 'Enterprise (1000+)',
              industry: 'Manufacturing',
              email: 'david.park@megacorp.com',
              hiringPower: 'Medium',
              activePositions: 12,
              skillsLookingFor: ['Operations', 'Six Sigma', 'Project Management', 'Engineering'],
              preferredExperience: '3-10 years',
              decisionMaker: false,
              avatar: '👨‍💼',
              connectionStrength: 78
            },
            {
              id: 'auth_5',
              name: 'Lisa Thompson',
              role: 'CTO',
              level: 'C-Suite',
              company: 'InnovateTech',
              companySize: 'Mid-size (100-1000)',
              industry: 'Technology',
              email: 'lisa@innovatetech.com',
              hiringPower: 'High',
              activePositions: 6,
              skillsLookingFor: ['Architecture', 'DevOps', 'Machine Learning', 'Team Leadership'],
              preferredExperience: '7-15 years',
              decisionMaker: true,
              avatar: '👩‍💼',
              connectionStrength: 89
            }
          ]
          setAuthorities(sampleAuthorities)
          setCompanies([])
          setSkills([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching authorities:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper functions
  const getCompanyByName = (companyName) => {
    if (!companyName) return null
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

  const getHiringPowerColor = (power) => {
    switch (power) {
      case 'Ultimate': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompanySizeColor = (size) => {
    if (size.includes('Startup')) return 'bg-green-100 text-green-800'
    if (size.includes('Mid-size')) return 'bg-blue-100 text-blue-800'
    if (size.includes('Enterprise')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const filteredAuthorities = authorities.filter(auth => {
    return (
      (filters.role === '' || auth.level.toLowerCase().includes(filters.role.toLowerCase())) &&
      (filters.companySize === '' || auth.companySize.includes(filters.companySize)) &&
      (filters.industry === '' || auth.industry.toLowerCase().includes(filters.industry.toLowerCase()))
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-800 mb-4">
            Hiring Authorities
          </h1>
          <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
            Connect directly with decision makers. Our graph database maps company hierarchies to identify the right hiring authority for your skills and experience level.
          </p>
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
        {loading ? (
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
                      <div className="text-3xl">{authority.avatar}</div>
                      <div>
                        <h3 className="font-semibold text-secondary-800">{authority.name}</h3>
                        <p className="text-sm text-candid-gray-600">{authority.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">{authority.connectionStrength}%</div>
                      <div className="text-xs text-candid-gray-500">Match Score</div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mb-4">
                    <div className="mb-2">
                      <CompanyLink company={getCompanyByName(authority.company)} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getCompanySizeColor(authority.companySize)}`}>
                        {authority.companySize}
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
                      {authority.skillsLookingFor.slice(0, 3).map((skill, index) => (
                        <SkillLink key={index} skill={getSkillByName(skill)} size="xs" />
                      ))}
                      {authority.skillsLookingFor.length > 3 && (
                        <span className="badge badge-secondary text-xs">
                          +{authority.skillsLookingFor.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-candid-gray-600 mb-4">
                    <span>{authority.activePositions} open positions</span>
                    <span>{authority.preferredExperience} exp.</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/hiring-authorities/${authority.id || authority._key}`}
                      className="btn-primary text-sm py-2 px-4 flex-1 text-center"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAuthorities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-candid-gray-600">No hiring authorities match your current filters.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
