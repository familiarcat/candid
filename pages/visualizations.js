import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import AuthorityNetworkGraph from '../components/visualizations/AuthorityNetworkGraph'
import NetworkVisualization3D from '../components/visualizations/NetworkVisualization3D'
import { generateNetworkData, generateFocusedNetworkData } from '../lib/graphDataGenerator'
import { useData } from '../contexts/DataContext'

export default function Visualizations() {
  const {
    companies,
    hiringAuthorities,
    jobSeekers,
    skills,
    positions,
    matches,
    loading: dataLoading,
    errors,
    fetchAllData
  } = useData()

  const [activeTab, setActiveTab] = useState('network')
  const [visualizationMode, setVisualizationMode] = useState('2d') // '2d' or '3d'
  const [loading, setLoading] = useState(true)

  // Memoized network data generation - only recalculates when data actually changes
  const networkData = useMemo(() => {
    if (dataLoading || companies.length === 0) {
      return { nodes: [], links: [], stats: {} }
    }

    console.log('🔄 Generating network data (memoized)...')
    const startTime = performance.now()

    try {
      const data = generateNetworkData(
        companies,
        hiringAuthorities,
        jobSeekers,
        skills,
        positions,
        matches
      )

      const endTime = performance.now()
      console.log('✅ Network data generated:', {
        nodes: data.nodes.length,
        links: data.links.length,
        stats: data.stats,
        generationTime: `${(endTime - startTime).toFixed(2)}ms`
      })

      return data
    } catch (error) {
      console.error('❌ Error generating visualization data:', error)
      return { nodes: [], links: [], stats: {} }
    }
  }, [companies, hiringAuthorities, jobSeekers, skills, positions, matches, dataLoading])

  useEffect(() => {
    // Fetch all data using DataContext if not already loaded
    if (!dataLoading && companies.length === 0) {
      fetchAllData()
    }
  }, [dataLoading, companies.length, fetchAllData])

  // Update loading state based on data availability
  useEffect(() => {
    setLoading(dataLoading || networkData.nodes.length === 0)
  }, [dataLoading, networkData.nodes.length])

  const tabs = [
    { id: 'network', name: 'Authority Network', icon: '🌐' },
    { id: 'hierarchy', name: 'Company Hierarchy', icon: '🏢' },
    { id: 'heatmap', name: 'Match Heatmap', icon: '🔥' },
    { id: 'skills', name: 'Skill Demand', icon: '📊' }
  ]

  // Enhanced error handling with proper filtering and logging
  const activeErrors = Object.entries(errors || {})
    .filter(([, error]) => error !== null && error !== undefined)
    .map(([key, error]) => `${key}: ${error}`)

  if (activeErrors.length > 0) {
    console.error('Visualizations page errors:', errors)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="font-semibold mb-2">Error loading visualization data:</div>
            <ul className="list-disc list-inside space-y-1">
              {activeErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (loading || dataLoading) {
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{companies.length}</div>
            <div className="text-sm text-candid-gray-500">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{hiringAuthorities.length}</div>
            <div className="text-sm text-candid-gray-500">Authorities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{jobSeekers.length}</div>
            <div className="text-sm text-candid-gray-500">Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{skills.length}</div>
            <div className="text-sm text-candid-gray-500">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{positions.length}</div>
            <div className="text-sm text-candid-gray-500">Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">{matches.length}</div>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-secondary-800">
                    Enhanced Network Visualization
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setVisualizationMode('2d')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        visualizationMode === '2d'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      2D Network
                    </button>
                    <button
                      onClick={() => setVisualizationMode('3d')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        visualizationMode === '3d'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      3D Network
                    </button>
                  </div>
                </div>

                <p className="text-candid-gray-600 mb-6">
                  Interactive network showing connections between companies, hiring authorities, job seekers, skills, and positions.
                  {visualizationMode === '2d'
                    ? 'Drag nodes to explore relationships, hover for details, and click for more information.'
                    : 'Click nodes to select, drag to rotate the 3D view, and explore the network in three dimensions.'
                  }
                </p>

                {/* Network Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">{networkData.nodes?.length || 0}</div>
                    <div className="text-xs text-blue-600">Total Nodes</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-600">{networkData.links?.length || 0}</div>
                    <div className="text-xs text-green-600">Total Connections</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {networkData.stats?.linkTypes?.match || 0}
                    </div>
                    <div className="text-xs text-purple-600">Match Connections</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {networkData.stats?.linkTypes?.skill || 0}
                    </div>
                    <div className="text-xs text-orange-600">Skill Connections</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  {visualizationMode === '2d' ? (
                    <AuthorityNetworkGraph
                      data={networkData}
                      width={800}
                      height={600}
                    />
                  ) : (
                    <NetworkVisualization3D
                      data={networkData}
                      width={800}
                      height={600}
                    />
                  )}
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
                  {companies.map((company) => {
                    const companyAuthorities = hiringAuthorities.filter(auth =>
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
                  <p className="text-sm mt-2">Will show {matches.length} authority matches</p>
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
                      {skills.slice(0, 10).map((skill, index) => {
                        const jobSeekerCount = jobSeekers.filter(js =>
                          js.skills?.includes(skill._key)
                        ).length

                        return (
                          <div key={skill._key} className="flex justify-between items-center">
                            <span className="text-sm">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${(jobSeekerCount / jobSeekers.length) * 100}%` }}
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
                      {skills.slice(0, 10).map((skill, index) => {
                        const authorityCount = hiringAuthorities.filter(auth =>
                          auth.skillsLookingFor?.includes(skill.name)
                        ).length

                        return (
                          <div key={skill._key} className="flex justify-between items-center">
                            <span className="text-sm">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-accent-500 h-2 rounded-full"
                                  style={{ width: `${(authorityCount / hiringAuthorities.length) * 100}%` }}
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
                  {matches.filter(m => (m.score || m.matchScore || 0) >= 80).length} high-quality matches (80%+ score)
                  out of {matches.length} total connections
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <h4 className="font-semibold mb-2">Company Distribution</h4>
                <p className="text-sm text-candid-gray-600">
                  {companies.filter(c => c.employeeCount < 100).length} startups, {' '}
                  {companies.filter(c => c.employeeCount >= 100 && c.employeeCount < 1000).length} mid-size, {' '}
                  {companies.filter(c => c.employeeCount >= 1000).length} enterprise
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👔</div>
                <h4 className="font-semibold mb-2">Authority Levels</h4>
                <p className="text-sm text-candid-gray-600">
                  {hiringAuthorities.filter(a => a.hiringPower === 'Ultimate').length} ultimate, {' '}
                  {hiringAuthorities.filter(a => a.hiringPower === 'High').length} high, {' '}
                  {hiringAuthorities.filter(a => a.hiringPower === 'Medium').length} medium power authorities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
