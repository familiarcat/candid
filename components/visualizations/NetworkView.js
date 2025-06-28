import { useState, useEffect } from 'react'
import { useVisualizationData } from './VisualizationDataProvider'
import AuthorityNetworkGraph from './AuthorityNetworkGraph'
import NetworkVisualization3D from './NetworkVisualization3D_Simple'
import GraphCard from './GraphCard'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'
import { LoadingOverlay, VisualizationLoadingAnimation, PageTransition } from '../animations/LoadingAnimations'
import { ResponsiveVisualizationContainer, MobileVisualizationControls, MobileVisualizationGestures } from '../mobile/ResponsiveVisualization'
import { mobileDetector } from '../../lib/mobileAnimations'

export default function NetworkView() {
  const { globalNetworkData, loading, errors } = useVisualizationData()
  const [visualizationMode, setVisualizationMode] = useState('2d') // '2d' or '3d'
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [mobileFilters, setMobileFilters] = useState({
    showMatches: true,
    showSkills: true,
    showCompanies: true
  })

  // Sample data for the instructional graph card
  const instructionalData = {
    nodes: [
      { id: 'company', name: 'Company', type: 'company', size: 12, central: true },
      { id: 'authority', name: 'Authority', type: 'authority', size: 10 },
      { id: 'jobSeeker', name: 'Job Seeker', type: 'jobSeeker', size: 8 },
      { id: 'skill', name: 'Skill', type: 'skill', size: 6 },
    ],
    links: [
      { source: 'company', target: 'authority', type: 'employment' },
      { source: 'authority', target: 'jobSeeker', type: 'match' },
      { source: 'jobSeeker', target: 'skill', type: 'has' },
      { source: 'authority', target: 'skill', type: 'seeks' },
    ],
    stats: {}
  }

  // Animate stats cards on mount
  useEffect(() => {
    if (globalNetworkData && !loading) {
      const timer = setTimeout(() => setStatsVisible(true), 300)
      return () => clearTimeout(timer)
    }
  }, [globalNetworkData, loading])

  // Handle visualization mode transitions
  const handleModeChange = async (newMode) => {
    if (newMode === visualizationMode) return

    setIsTransitioning(true)

    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200))

    setVisualizationMode(newMode)
    setIsTransitioning(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <VisualizationLoadingAnimation type="network" />
      </div>
    )
  }

  if (errors.length > 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Error Loading Network Data</h3>
        <ul className="text-red-700 text-sm space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (!globalNetworkData || globalNetworkData.nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🕸️</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Network Data</h3>
        <p className="text-gray-600">No network connections available to visualize.</p>
      </div>
    )
  }

  return (
    <PageTransition isLoading={loading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="transform transition-all duration-500 translate-y-0 opacity-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Global Network View</h2>
            <p className="text-gray-600 mt-2">
              Interactive network showing all connections in the system
            </p>
          </div>
        </div>

        {/* Mobile-optimized controls */}
        <MobileVisualizationControls
          visualizationMode={visualizationMode}
          onModeChange={handleModeChange}
          filters={mobileFilters}
          onFiltersChange={setMobileFilters}
          className="mb-6"
        />

        {/* Network Stats with staggered animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: globalNetworkData.nodes?.length || 0,
              label: 'Total Nodes',
              color: 'blue',
              delay: 0
            },
            {
              value: globalNetworkData.links?.length || 0,
              label: 'Total Connections',
              color: 'green',
              delay: 100
            },
            {
              value: globalNetworkData.stats?.linkTypes?.match || 0,
              label: 'Match Connections',
              color: 'purple',
              delay: 200
            },
            {
              value: globalNetworkData.stats?.linkTypes?.skill || 0,
              label: 'Skill Connections',
              color: 'orange',
              delay: 300
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-${stat.color}-50 p-4 rounded-lg text-center transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
                statsVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }`}
              style={{
                transitionDelay: `${stat.delay}ms`
              }}
            >
              <div className={`text-2xl font-bold text-${stat.color}-600 transition-all duration-300`}>
                {stat.value}
              </div>
              <div className={`text-sm text-${stat.color}-600`}>{stat.label}</div>
            </div>
          ))}
        </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-2">How to Use</h3>
            <p className="text-sm text-gray-600">
              {visualizationMode === '2d'
                ? 'Drag nodes to explore relationships, hover for details, and click for more information. Use mouse wheel to zoom in/out.'
                : 'Click and drag to rotate the 3D view, use mouse wheel to zoom, and click nodes to select them. Explore the network in three dimensions.'
              }
            </p>
          </div>
          <div className="w-full md:w-auto">
            <GraphCard
              networkData={instructionalData}
              size="mini"
              interactive={false}
            />
          </div>
        </div>
      </div>

        {/* Responsive Visualization Container */}
        <LoadingOverlay
          isVisible={isTransitioning}
          type="visualization"
          message={`Switching to ${visualizationMode.toUpperCase()} view...`}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 md:p-6 transform transition-all duration-500 hover:shadow-xl">
            <ResponsiveVisualizationContainer
              minHeight={mobileDetector.isMobile ? 300 : 400}
              maxHeight={mobileDetector.isMobile ? 500 : 800}
              className="bg-gray-50 rounded-lg overflow-hidden"
            >
              {(dimensions) => (
                <MobileVisualizationGestures
                  onZoomIn={() => console.log('Zoom in')}
                  onZoomOut={() => console.log('Zoom out')}
                  onReset={() => console.log('Reset view')}
                  className="w-full h-full"
                >
                  {visualizationMode === '2d' ? (
                    <AuthorityNetworkGraph
                      data={globalNetworkData}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ) : (
                    <NetworkVisualization3D
                      data={globalNetworkData}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  )}
                </MobileVisualizationGestures>
              )}
            </ResponsiveVisualizationContainer>
          </div>
        </LoadingOverlay>

      {/* Detailed Stats */}
      {globalNetworkData.stats && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Statistics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Node Types */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Node Distribution</h4>
              <div className="space-y-2">
                {Object.entries(globalNetworkData.stats.nodeTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize text-gray-600">{type}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link Types */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Connection Types</h4>
              <div className="space-y-2">
                {Object.entries(globalNetworkData.stats.linkTypes || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize text-gray-600">{type}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {globalNetworkData.stats.connectionsPerNode || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Avg Connections/Node</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {globalNetworkData.stats.syntheticLinks || 0}
                </div>
                <div className="text-sm text-gray-600">Synthetic Connections</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {((globalNetworkData.stats.syntheticLinks || 0) / (globalNetworkData.links?.length || 1) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Synthetic Ratio</div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  )
}
