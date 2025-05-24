import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import VisualizationModal from '../components/VisualizationModal'
import { generateSampleGraphData } from '../lib/graphData'

export default function GlobalView() {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showVisualization, setShowVisualization] = useState(false)
  const [stats, setStats] = useState({})
  const [selectedEntityType, setSelectedEntityType] = useState('all')
  const [networkMetrics, setNetworkMetrics] = useState({})

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        // Simulate API call - in real app this would fetch comprehensive network data
        setTimeout(() => {
          const data = generateSampleGraphData()
          setGraphData(data)
          
          // Calculate network statistics
          const nodesByType = data.nodes.reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1
            return acc
          }, {})

          const linksByType = data.links.reduce((acc, link) => {
            acc[link.type] = (acc[link.type] || 0) + 1
            return acc
          }, {})

          setStats({
            totalNodes: data.nodes.length,
            totalLinks: data.links.length,
            nodesByType,
            linksByType
          })

          // Calculate network metrics
          setNetworkMetrics({
            density: ((data.links.length * 2) / (data.nodes.length * (data.nodes.length - 1)) * 100).toFixed(2),
            avgConnections: (data.links.length * 2 / data.nodes.length).toFixed(1),
            clusters: Math.ceil(data.nodes.length / 8), // Simplified cluster calculation
            centralNodes: data.nodes.filter(node => node.size > 8).length
          })

          setLoading(false)
        }, 1000)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchGlobalData()
  }, [])

  const filteredData = graphData ? {
    nodes: selectedEntityType === 'all' 
      ? graphData.nodes 
      : graphData.nodes.filter(node => node.type === selectedEntityType),
    links: selectedEntityType === 'all'
      ? graphData.links
      : graphData.links.filter(link => {
          const sourceNode = graphData.nodes.find(n => n.id === link.source)
          const targetNode = graphData.nodes.find(n => n.id === link.target)
          return sourceNode?.type === selectedEntityType || targetNode?.type === selectedEntityType
        })
  } : { nodes: [], links: [] }

  const entityTypes = [
    { value: 'all', label: 'All Entities', icon: '🌐', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'jobSeeker', label: 'Job Seekers', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { value: 'company', label: 'Companies', icon: '🏢', color: 'bg-teal-100 text-teal-800' },
    { value: 'position', label: 'Positions', icon: '📋', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'skill', label: 'Skills', icon: '🔧', color: 'bg-amber-100 text-amber-800' }
  ]

  const relationshipTypes = [
    { type: 'works_for', label: 'Employment', icon: '💼', color: 'bg-blue-500' },
    { type: 'posts', label: 'Job Postings', icon: '📝', color: 'bg-emerald-500' },
    { type: 'requires', label: 'Skill Requirements', icon: '🎯', color: 'bg-amber-500' },
    { type: 'has_skill', label: 'Skill Possession', icon: '⭐', color: 'bg-purple-500' },
    { type: 'matched_to', label: 'Job Matches', icon: '🤝', color: 'bg-red-500' }
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
                    {stats.nodesByType?.[type.value] || stats.totalNodes || 0} nodes
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
              {Object.entries(stats.nodesByType || {}).map(([type, count]) => {
                const entityType = entityTypes.find(et => et.value === type)
                const percentage = ((count / stats.totalNodes) * 100).toFixed(1)
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{entityType?.icon || '📄'}</span>
                      <span className="font-medium">{entityType?.label || type}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
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
              {relationshipTypes.map((relType) => {
                const count = stats.linksByType?.[relType.type] || 0
                const percentage = stats.totalLinks > 0 ? ((count / stats.totalLinks) * 100).toFixed(1) : 0
                
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
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Network Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Network Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <span className="text-3xl block mb-2">🎯</span>
              <h3 className="font-medium text-emerald-800">High Match Potential</h3>
              <p className="text-sm text-emerald-600 mt-1">
                Strong skill alignment across the network
              </p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <span className="text-3xl block mb-2">📈</span>
              <h3 className="font-medium text-amber-800">Growing Connections</h3>
              <p className="text-sm text-amber-600 mt-1">
                Network density increasing over time
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl block mb-2">🔍</span>
              <h3 className="font-medium text-blue-800">Skill Gaps Identified</h3>
              <p className="text-sm text-blue-600 mt-1">
                Opportunities for talent development
              </p>
            </div>
          </div>
        </div>
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
