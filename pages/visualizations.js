import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import AuthorityNetworkGraph from '../components/visualizations/AuthorityNetworkGraph'
import { transformToNetworkData, transformToHierarchyData, transformToMatchHeatmap, transformToSkillDemandData } from '../lib/visualizationData'

export default function Visualizations() {
  const [data, setData] = useState({
    companies: [],
    hiringAuthorities: [],
    jobSeekers: [],
    skills: [],
    matches: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('network')
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [companiesRes, authoritiesRes, jobSeekersRes, skillsRes, matchesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/hiring-authorities'),
          fetch('/api/job-seekers'),
          fetch('/api/skills'),
          fetch('/api/matches')
        ])

        const [companies, authoritiesData, jobSeekersData, skills, matchesData] = await Promise.all([
          companiesRes.json(),
          authoritiesRes.json(),
          jobSeekersRes.json(),
          skillsRes.json(),
          matchesRes.json()
        ])

        const fetchedData = {
          companies: companies.companies || companies,
          hiringAuthorities: authoritiesData.authorities || authoritiesData,
          jobSeekers: jobSeekersData.jobSeekers || jobSeekersData,
          skills: skills.skills || skills,
          matches: matchesData.matches || matchesData
        }

        setData(fetchedData)

        // Transform data for network visualization
        const networkData = transformToNetworkData(
          fetchedData.companies,
          fetchedData.hiringAuthorities,
          fetchedData.jobSeekers,
          fetchedData.skills,
          fetchedData.matches
        )
        setNetworkData(networkData)

      } catch (error) {
        console.error('Error fetching visualization data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const tabs = [
    { id: 'network', name: 'Authority Network', icon: '🌐' },
    { id: 'hierarchy', name: 'Company Hierarchy', icon: '🏢' },
    { id: 'heatmap', name: 'Match Heatmap', icon: '🔥' },
    { id: 'skills', name: 'Skill Demand', icon: '📊' }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-candid-gray-600">Loading visualization data...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Data Visualizations | Candid Connections Katra</title>
        <meta name="description" content="Interactive visualizations of hiring authority networks, company hierarchies, and skill connections." />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary-800 mb-4">
            Data Visualizations
          </h1>
          <p className="text-xl text-candid-gray-600 max-w-3xl mx-auto">
            Explore the interconnected relationships between job seekers, hiring authorities, companies, and skills through interactive visualizations.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.companies.length}</div>
            <div className="text-sm text-candid-gray-500">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{data.hiringAuthorities.length}</div>
            <div className="text-sm text-candid-gray-500">Authorities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.jobSeekers.length}</div>
            <div className="text-sm text-candid-gray-500">Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.skills.length}</div>
            <div className="text-sm text-candid-gray-500">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">{data.matches.length}</div>
            <div className="text-sm text-candid-gray-500">Matches</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-candid-gray-500 hover:text-candid-gray-700 hover:border-candid-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Visualization Content */}
        <div className="card">
          <div className="card-body">
            {activeTab === 'network' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                  Authority Network Graph
                </h3>
                <p className="text-candid-gray-600 mb-6">
                  Interactive network showing connections between companies, hiring authorities, job seekers, and skills. 
                  Drag nodes to explore relationships, hover for details, and click for more information.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <AuthorityNetworkGraph 
                    data={networkData} 
                    width={800} 
                    height={600} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'hierarchy' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                  Company Hierarchy Visualization
                </h3>
                <p className="text-candid-gray-600 mb-6">
                  Organizational charts showing hiring authority levels within each company based on size and structure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.companies.map((company) => {
                    const companyAuthorities = data.hiringAuthorities.filter(auth => 
                      auth.companyId === `companies/${company._key}`
                    )
                    
                    return (
                      <div key={company._key} className="border rounded-lg p-4">
                        <div className="text-center mb-4">
                          <h4 className="font-semibold text-lg">{company.name}</h4>
                          <p className="text-sm text-candid-gray-600">
                            {company.employeeCount} employees • {company.industry}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          {['C-Suite', 'Executive', 'Director', 'Manager'].map(level => {
                            const authoritiesAtLevel = companyAuthorities.filter(auth => auth.level === level)
                            if (authoritiesAtLevel.length === 0) return null
                            
                            return (
                              <div key={level} className="border-l-4 border-primary-500 pl-4">
                                <h5 className="font-medium text-sm text-secondary-700">{level}</h5>
                                <div className="space-y-1">
                                  {authoritiesAtLevel.map(auth => (
                                    <div key={auth._key} className="text-xs">
                                      <span className="font-medium">{auth.name}</span>
                                      <span className="text-candid-gray-500"> - {auth.role}</span>
                                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                        auth.hiringPower === 'Ultimate' ? 'bg-red-100 text-red-800' :
                                        auth.hiringPower === 'High' ? 'bg-orange-100 text-orange-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {auth.hiringPower}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                  Authority Match Heatmap
                </h3>
                <p className="text-candid-gray-600 mb-6">
                  Heat map showing match strength between job seekers and hiring authorities. 
                  Darker colors indicate stronger matches.
                </p>
                <div className="text-center text-candid-gray-500 py-12">
                  <div className="text-4xl mb-4">🔥</div>
                  <p>Interactive heatmap visualization coming soon...</p>
                  <p className="text-sm mt-2">Will show {data.matches.length} authority matches</p>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">
                  Skill Demand Analysis
                </h3>
                <p className="text-candid-gray-600 mb-6">
                  Analysis of skill supply and demand across job seekers and hiring authorities.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Skills by Job Seekers */}
                  <div>
                    <h4 className="font-semibold mb-3">Most Common Skills (Job Seekers)</h4>
                    <div className="space-y-2">
                      {data.skills.slice(0, 10).map((skill, index) => {
                        const jobSeekerCount = data.jobSeekers.filter(js => 
                          js.skills?.includes(skill._key)
                        ).length
                        
                        return (
                          <div key={skill._key} className="flex justify-between items-center">
                            <span className="text-sm">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-500 h-2 rounded-full" 
                                  style={{ width: `${(jobSeekerCount / data.jobSeekers.length) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-candid-gray-500">{jobSeekerCount}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top Skills by Authorities */}
                  <div>
                    <h4 className="font-semibold mb-3">Most Demanded Skills (Authorities)</h4>
                    <div className="space-y-2">
                      {data.skills.slice(0, 10).map((skill, index) => {
                        const authorityCount = data.hiringAuthorities.filter(auth => 
                          auth.skillsLookingFor?.includes(skill.name)
                        ).length
                        
                        return (
                          <div key={skill._key} className="flex justify-between items-center">
                            <span className="text-sm">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-accent-500 h-2 rounded-full" 
                                  style={{ width: `${(authorityCount / data.hiringAuthorities.length) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-candid-gray-500">{authorityCount}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-secondary-800 mb-4">
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold mb-2">Match Quality</h4>
                <p className="text-sm text-candid-gray-600">
                  {data.matches.filter(m => m.score >= 80).length} high-quality matches (80%+ score) 
                  out of {data.matches.length} total connections
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <h4 className="font-semibold mb-2">Company Distribution</h4>
                <p className="text-sm text-candid-gray-600">
                  {data.companies.filter(c => c.employeeCount < 100).length} startups, {' '}
                  {data.companies.filter(c => c.employeeCount >= 100 && c.employeeCount < 1000).length} mid-size, {' '}
                  {data.companies.filter(c => c.employeeCount >= 1000).length} enterprise
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👔</div>
                <h4 className="font-semibold mb-2">Authority Levels</h4>
                <p className="text-sm text-candid-gray-600">
                  {data.hiringAuthorities.filter(a => a.hiringPower === 'Ultimate').length} ultimate, {' '}
                  {data.hiringAuthorities.filter(a => a.hiringPower === 'High').length} high, {' '}
                  {data.hiringAuthorities.filter(a => a.hiringPower === 'Medium').length} medium power authorities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
