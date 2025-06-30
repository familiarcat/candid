// Enhanced Graph Explorer - Revolutionary context-aware visualization with root node emphasis
// Integrates unified controls, sorting, and seamless 2D/3D switching

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useVisualizationData } from './VisualizationDataProvider'
import UnifiedVisualizationControls from './UnifiedVisualizationControls'
import AuthorityNetworkGraph from './AuthorityNetworkGraph'
import NetworkVisualization3D from './NetworkVisualization3D_Simple'
import { SORTING_METHODS } from '../../lib/visualizationSorting'

export default function EnhancedGraphExplorer() {
  const router = useRouter()
  const {
    entities,
    loading,
    generateEnhancedVisualization,
    globalNetworkData
  } = useVisualizationData()

  // Visualization state
  const [rootNode, setRootNode] = useState(null)
  const [sortMethod, setSortMethod] = useState(SORTING_METHODS.RELATIONSHIP_STRENGTH)
  const [filters, setFilters] = useState({
    maxDistance: 3,
    hiddenTypes: [],
    ascending: false
  })
  const [layoutType, setLayoutType] = useState('force')
  const [visualizationMode, setVisualizationMode] = useState('2d')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-select first available entity as root node if none selected
  useEffect(() => {
    if (!rootNode && !loading) {
      // Priority order for auto-selection
      const priorityOrder = ['companies', 'authorities', 'jobSeekers', 'skills', 'positions']

      for (const entityType of priorityOrder) {
        const entityList = entities[entityType] || []
        if (entityList.length > 0) {
          const firstEntity = entityList[0]
          setRootNode({
            ...firstEntity,
            type: entityType.slice(0, -1) // Remove 's' from plural
          })
          break
        }
      }
    }
  }, [entities, loading, rootNode])

  // Generate enhanced visualization data
  const visualizationData = useMemo(() => {
    if (!rootNode) return { nodes: [], links: [], stats: {} }

    return generateEnhancedVisualization(rootNode.id, {
      sortMethod,
      maxDistance: filters.maxDistance,
      layoutType,
      filters
    })
  }, [rootNode, sortMethod, filters, layoutType, generateEnhancedVisualization])

  // Handle root node changes with smooth transitions
  const handleRootNodeChange = async (newRootNode) => {
    setIsTransitioning(true)

    // Small delay for smooth transition effect
    setTimeout(() => {
      setRootNode(newRootNode)
      setIsTransitioning(false)
    }, 150)
  }

  // Handle visualization mode changes
  const handleVisualizationModeChange = (mode) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setVisualizationMode(mode)
      setIsTransitioning(false)
    }, 100)
  }

  // Handle node clicks for context switching
  const handleNodeClick = (clickedNode) => {
    if (clickedNode.contextSwitchable && clickedNode.id !== rootNode?.id) {
      handleRootNodeChange(clickedNode)
    }
  }

  // Handle reset view
  const handleResetView = () => {
    setFilters({
      maxDistance: 3,
      hiddenTypes: [],
      ascending: false
    })
    setSortMethod(SORTING_METHODS.RELATIONSHIP_STRENGTH)
    setLayoutType('force')
  }

  // Navigation helpers
  const getEntityPageUrl = (entityType) => {
    const pageMap = {
      company: '/companies',
      authority: '/hiring-authorities',
      jobSeeker: '/job-seekers',
      skill: '/skills',
      position: '/positions'
    }
    return pageMap[entityType] || '/'
  }

  const handleNavigateToEntityPage = (entityType) => {
    router.push(getEntityPageUrl(entityType))
  }

  const handleNavigateToEntityDetail = (entity) => {
    const baseUrl = getEntityPageUrl(entity.type)
    router.push(`${baseUrl}?id=${entity.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced visualization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Graph Explorer</h2>
        <p className="text-gray-600">
          Context-aware visualization with root node emphasis and advanced sorting
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1">
          <UnifiedVisualizationControls
            entities={entities}
            currentRootNode={rootNode}
            currentSortMethod={sortMethod}
            currentFilters={filters}
            currentLayout={layoutType}
            visualizationMode={visualizationMode}
            onRootNodeChange={handleRootNodeChange}
            onSortMethodChange={setSortMethod}
            onFiltersChange={setFilters}
            onLayoutChange={setLayoutType}
            onVisualizationModeChange={handleVisualizationModeChange}
            onResetView={handleResetView}
            showAdvanced={true}
          />
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Visualization Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {rootNode ? (
                      <>
                        <span className="mr-2">🎯</span>
                        {rootNode.name} Network
                      </>
                    ) : (
                      'Select a Root Node'
                    )}
                  </h3>
                  {rootNode && (
                    <p className="text-sm text-gray-600 mt-1">
                      {visualizationData.nodes.length} nodes • {visualizationData.links.length} connections
                      {visualizationData.sortMethod && (
                        <> • Sorted by {visualizationData.sortMethod.replace('_', ' ')}</>
                      )}
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  {rootNode && (
                    <button
                      onClick={() => handleNavigateToEntityDetail(rootNode)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                      title={`View ${rootNode.name} details`}
                    >
                      📋 View Details
                    </button>
                  )}
                  <button
                    onClick={handleResetView}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    title="Reset view"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* Visualization Content */}
            <div className="relative">
              {isTransitioning && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="loading-spinner w-6 h-6 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Updating visualization...</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                {!rootNode ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Choose a Root Node</h3>
                    <p className="text-gray-600">
                      Select an entity from the controls panel to begin exploring connections
                    </p>
                  </div>
                ) : visualizationData.nodes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Connections Found</h3>
                    <p className="text-gray-600">
                      {rootNode.name} doesn't have any connections within the current filters
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                    {visualizationMode === '2d' ? (
                      <AuthorityNetworkGraph
                        data={visualizationData}
                        width={800}
                        height={600}
                        onNodeClick={handleNodeClick}
                        rootNodeId={rootNode.id}
                        interactive={true}
                      />
                    ) : (
                      <NetworkVisualization3D
                        data={visualizationData}
                        width={800}
                        height={600}
                        onNodeClick={handleNodeClick}
                        rootNodeId={rootNode.id}
                        autoRotate={false}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {rootNode && visualizationData.stats && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Network Statistics</h3>

            {/* Entity Type Navigation */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Explore by type:</span>
              {[
                { type: 'company', icon: '🏢', label: 'Companies' },
                { type: 'authority', icon: '👔', label: 'Authorities' },
                { type: 'jobSeeker', icon: '👥', label: 'Job Seekers' },
                { type: 'skill', icon: '🛠️', label: 'Skills' },
                { type: 'position', icon: '📋', label: 'Positions' }
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleNavigateToEntityPage(type)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title={`View all ${label}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {visualizationData.stats.rootConnections || 0}
              </div>
              <div className="text-sm text-gray-600">Direct Connections</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {visualizationData.nodes.length}
              </div>
              <div className="text-sm text-gray-600">Total Nodes</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {visualizationData.links.length}
              </div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filters.maxDistance}
              </div>
              <div className="text-sm text-gray-600">Max Distance</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.keys(visualizationData.stats.nodesAtDistance || {}).length}
              </div>
              <div className="text-sm text-gray-600">Distance Levels</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {visualizationMode.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">View Mode</div>
            </div>
          </div>

          {/* Distance Distribution */}
          {visualizationData.stats.nodesAtDistance && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Nodes by Distance from Root</h4>
              <div className="flex items-end space-x-2 h-16">
                {Object.entries(visualizationData.stats.nodesAtDistance).map(([distance, count]) => (
                  <div key={distance} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-blue-500 rounded-t w-full min-h-1"
                      style={{
                        height: `${Math.max(4, (count / Math.max(...Object.values(visualizationData.stats.nodesAtDistance))) * 48)}px`
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">{distance}</div>
                    <div className="text-xs text-gray-500">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
