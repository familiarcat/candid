import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import VisualizationModal from '../components/VisualizationModal'
import { VisualizationDataProvider, useVisualizationData } from '../components/visualizations/VisualizationDataProvider'
import { calculateNetworkInsights, getTrendDisplay } from '../lib/networkInsights'

// Real Global View Component using database data
function GlobalViewContent() {
  const {
    rawData,
    loading,
    errors,
    globalNetworkData,
    entities
  } = useVisualizationData()

  const [showVisualization, setShowVisualization] = useState(false)
  const [selectedEntityType, setSelectedEntityType] = useState('all')
  const [networkInsights, setNetworkInsights] = useState(null)

  // Calculate real network insights when data is available
  useEffect(() => {
    if (!loading && rawData && globalNetworkData) {
      const insights = calculateNetworkInsights(rawData, globalNetworkData)
      setNetworkInsights(insights)
    }
  }, [loading, rawData, globalNetworkData])

  // Calculate real-time statistics from database data
  const stats = {
    totalNodes: globalNetworkData?.nodes?.length || 0,
    totalLinks: globalNetworkData?.links?.length || 0,
    companies: entities.companies?.length || 0,
    authorities: entities.authorities?.length || 0,
    jobSeekers: entities.jobSeekers?.length || 0,
    skills: entities.skills?.length || 0,
    positions: entities.positions?.length || 0,
    matches: entities.matches?.length || 0
  }

  // Calculate network metrics from real data
  const networkMetrics = {
    density: stats.totalNodes > 1 ?
      ((stats.totalLinks * 2) / (stats.totalNodes * (stats.totalNodes - 1)) * 100).toFixed(2) : 0,
    avgConnections: stats.totalNodes > 0 ?
      (stats.totalLinks * 2 / stats.totalNodes).toFixed(1) : 0,
    clusters: Math.ceil(stats.totalNodes / 8),
    centralNodes: globalNetworkData?.nodes?.filter(node =>
      globalNetworkData.links.filter(link =>
        link.source === node.id || link.target === node.id
      ).length > 3
    ).length || 0
  }

  // Filter real network data by entity type
  const filteredData = globalNetworkData ? {
    nodes: selectedEntityType === 'all'
      ? globalNetworkData.nodes
      : globalNetworkData.nodes.filter(node => node.type === selectedEntityType),
    links: selectedEntityType === 'all'
      ? globalNetworkData.links
      : globalNetworkData.links.filter(link => {
          const sourceNode = globalNetworkData.nodes.find(n => n.id === link.source)
          const targetNode = globalNetworkData.nodes.find(n => n.id === link.target)
          return sourceNode?.type === selectedEntityType || targetNode?.type === selectedEntityType
        })
  } : { nodes: [], links: [] }

  // Real entity types with actual counts from database
  const entityTypes = [
    {
      value: 'all',
      label: 'All Entities',
      icon: '🌐',
      color: 'bg-indigo-100 text-indigo-800',
      count: stats.totalNodes
    },
    {
      value: 'jobSeeker',
      label: 'Job Seekers',
      icon: '👥',
      color: 'bg-blue-100 text-blue-800',
      count: stats.jobSeekers
    },
    {
      value: 'authority',
      label: 'Hiring Authorities',
      icon: '👔',
      color: 'bg-green-100 text-green-800',
      count: stats.authorities
    },
    {
      value: 'company',
      label: 'Companies',
      icon: '🏢',
      color: 'bg-teal-100 text-teal-800',
      count: stats.companies
    },
    {
      value: 'position',
      label: 'Positions',
      icon: '📋',
      color: 'bg-emerald-100 text-emerald-800',
      count: stats.positions
    },
    {
      value: 'skill',
      label: 'Skills',
      icon: '🛠️',
      color: 'bg-amber-100 text-amber-800',
      count: stats.skills
    }
  ]

  // Real relationship types with actual counts from network data
  const linksByType = globalNetworkData?.links?.reduce((acc, link) => {
    acc[link.type] = (acc[link.type] || 0) + 1
    return acc
  }, {}) || {}

  const relationshipTypes = [
    {
      type: 'works_for',
      label: 'Employment',
      icon: '💼',
      color: 'bg-blue-500',
      count: linksByType.works_for || 0
    },
    {
      type: 'posts',
      label: 'Job Postings',
      icon: '📝',
      color: 'bg-emerald-500',
      count: linksByType.posts || 0
    },
    {
      type: 'requires',
      label: 'Skill Requirements',
      icon: '🎯',
      color: 'bg-amber-500',
      count: linksByType.requires || 0
    },
    {
      type: 'has_skill',
      label: 'Skill Possession',
      icon: '⭐',
      color: 'bg-purple-500',
      count: linksByType.has_skill || 0
    },
    {
      type: 'matched_to',
      label: 'Job Matches',
      icon: '🤝',
      color: 'bg-red-500',
      count: linksByType.matched_to || stats.matches || 0
    }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (errors && Object.keys(errors).length > 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold mb-2">Data Loading Errors:</h3>
            {Object.entries(errors).map(([key, error]) => (
              <div key={key}>• {key}: {error}</div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Global Network View | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Global Network View</h1>
          <button
            onClick={() => setShowVisualization(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            🌐 Open Full Visualization
          </button>
        </div>

        {/* Network Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLinks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Network Density</p>
                <p className="text-2xl font-bold text-gray-900">{networkMetrics.density}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Connections</p>
                <p className="text-2xl font-bold text-gray-900">{networkMetrics.avgConnections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Central Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{networkMetrics.centralNodes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Type Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter by Entity Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {entityTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedEntityType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedEntityType === type.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type.count} {type.value === 'all' ? 'nodes' : 'entities'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Entity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Entities by Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Entities by Type</h2>
            <div className="space-y-4">
              {entityTypes.filter(et => et.value !== 'all' && et.count > 0).map((entityType) => {
                const percentage = stats.totalNodes > 0 ? ((entityType.count / stats.totalNodes) * 100).toFixed(1) : 0

                return (
                  <div key={entityType.value} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{entityType.icon}</span>
                      <span className="font-medium">{entityType.label}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{entityType.count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Relationships by Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Relationships by Type</h2>
            <div className="space-y-4">
              {relationshipTypes.filter(relType => relType.count > 0).map((relType) => {
                const percentage = stats.totalLinks > 0 ? ((relType.count / stats.totalLinks) * 100).toFixed(1) : 0

                return (
                  <div key={relType.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{relType.icon}</span>
                      <span className="font-medium">{relType.label}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${relType.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{relType.count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Real Network Insights - Fixed Alignment */}
        {networkInsights && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">🔍 Real-Time Network Insights</h2>
              {/* Filter by Entity Type Status */}
              <div className="text-sm text-gray-600">
                Showing: <span className="font-medium">
                  {entityTypes.find(et => et.value === selectedEntityType)?.label || 'All Entities'}
                </span>
                {selectedEntityType !== 'all' && (
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {filteredData.nodes.length} nodes
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Grid with Proper Alignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* High Match Potential */}
              <div className={`p-6 rounded-lg border-2 ${getTrendDisplay(networkInsights.highMatchPotential.trend).bg} ${
                getTrendDisplay(networkInsights.highMatchPotential.trend).trend === 'up' ? 'border-green-200' :
                getTrendDisplay(networkInsights.highMatchPotential.trend).trend === 'down' ? 'border-red-200' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">🎯 High Match Potential</h3>
                  <span className={`text-xl ${getTrendDisplay(networkInsights.highMatchPotential.trend).color}`}>
                    {getTrendDisplay(networkInsights.highMatchPotential.trend).icon}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {networkInsights.highMatchPotential.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {networkInsights.highMatchPotential.percentage}% high-quality matches
                </div>
                <div className="text-xs text-gray-500">
                  Avg score: {networkInsights.highMatchPotential.avgScore}%
                </div>
              </div>

              {/* Growing Connections */}
              <div className={`p-6 rounded-lg border-2 ${getTrendDisplay(networkInsights.growingConnections.trend).bg} ${
                getTrendDisplay(networkInsights.growingConnections.trend).trend === 'up' ? 'border-green-200' :
                getTrendDisplay(networkInsights.growingConnections.trend).trend === 'down' ? 'border-red-200' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">📈 Growing Connections</h3>
                  <span className={`text-xl ${getTrendDisplay(networkInsights.growingConnections.trend).color}`}>
                    {getTrendDisplay(networkInsights.growingConnections.trend).icon}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {networkInsights.growingConnections.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {networkInsights.growingConnections.density}% network density
                </div>
                <div className="text-xs text-gray-500">
                  {networkInsights.growingConnections.avgConnectionsPerNode} avg connections/node
                </div>
              </div>

              {/* Skill Gaps */}
              <div className={`p-6 rounded-lg border-2 ${getTrendDisplay(networkInsights.skillGaps.trend).bg} ${
                getTrendDisplay(networkInsights.skillGaps.trend).trend === 'up' ? 'border-red-200' :
                getTrendDisplay(networkInsights.skillGaps.trend).trend === 'down' ? 'border-green-200' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">🔍 Skill Gaps Identified</h3>
                  <span className={`text-xl ${getTrendDisplay(networkInsights.skillGaps.trend).color}`}>
                    {getTrendDisplay(networkInsights.skillGaps.trend).icon}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {networkInsights.skillGaps.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {networkInsights.skillGaps.criticalGaps} critical shortages
                </div>
                <div className="text-xs text-gray-500">
                  Avg gap: {networkInsights.skillGaps.avgGapSize} positions
                </div>
              </div>
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              {/* Top Skill Gaps */}
              {networkInsights.skillGaps.topGaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">🔥 Top Skill Gaps</h4>
                  <div className="space-y-2">
                    {networkInsights.skillGaps.topGaps.slice(0, 5).map((gap, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate">{gap.name}</span>
                        <span className={`font-medium ml-2 ${
                          gap.severity === 'high' ? 'text-red-600' :
                          gap.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          +{gap.gap}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Matches */}
              {networkInsights.highMatchPotential.topMatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">⭐ Top Potential Matches</h4>
                  <div className="space-y-2">
                    {networkInsights.highMatchPotential.topMatches.slice(0, 3).map((match, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium text-gray-800 truncate">{match.jobSeekerName}</div>
                        <div className="text-gray-600 text-xs truncate">{match.company} • {match.score}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Connections */}
              {networkInsights.growingConnections.recentConnections.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">🔗 Recent Connections</h4>
                  <div className="space-y-2">
                    {networkInsights.growingConnections.recentConnections.slice(0, 3).map((conn, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium text-gray-800 truncate">{conn.source}</div>
                        <div className="text-gray-600 text-xs truncate">→ {conn.target} • {conn.score}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visualization Modal */}
      <VisualizationModal
        isOpen={showVisualization}
        onClose={() => setShowVisualization(false)}
        data={filteredData}
        title={`Global Network - ${entityTypes.find(et => et.value === selectedEntityType)?.label || 'All Entities'}`}
      />
    </Layout>
  )
}

// Main component with data provider wrapper
export default function GlobalView() {
  return (
    <VisualizationDataProvider>
      <GlobalViewContent />
    </VisualizationDataProvider>
  )
}
