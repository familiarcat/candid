import { useState } from 'react'
import { useVisualizationData } from './VisualizationDataProvider'
import AuthorityNetworkGraph from './AuthorityNetworkGraph'
import NetworkVisualization3D from './NetworkVisualization3D_Simple'

export default function NetworkView() {
  const { globalNetworkData, loading, errors } = useVisualizationData()
  const [visualizationMode, setVisualizationMode] = useState('2d') // '2d' or '3d'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading network data...</p>
        </div>
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
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Network View</h2>
          <p className="text-gray-600">
            Interactive network showing all connections in the system
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setVisualizationMode('2d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visualizationMode === '2d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            2D Network
          </button>
          <button
            onClick={() => setVisualizationMode('3d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visualizationMode === '3d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            3D Network
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{globalNetworkData.nodes?.length || 0}</div>
          <div className="text-sm text-blue-600">Total Nodes</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{globalNetworkData.links?.length || 0}</div>
          <div className="text-sm text-green-600">Total Connections</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {globalNetworkData.stats?.linkTypes?.match || 0}
          </div>
          <div className="text-sm text-purple-600">Match Connections</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {globalNetworkData.stats?.linkTypes?.skill || 0}
          </div>
          <div className="text-sm text-orange-600">Skill Connections</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How to Use</h3>
        <p className="text-sm text-gray-600">
          {visualizationMode === '2d'
            ? 'Drag nodes to explore relationships, hover for details, and click for more information. Use mouse wheel to zoom in/out.'
            : 'Click and drag to rotate the 3D view, use mouse wheel to zoom, and click nodes to select them. Explore the network in three dimensions.'
          }
        </p>
      </div>

      {/* Visualization Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          {visualizationMode === '2d' ? (
            <AuthorityNetworkGraph
              data={globalNetworkData}
              width={800}
              height={600}
            />
          ) : (
            <NetworkVisualization3D
              data={globalNetworkData}
              width={800}
              height={600}
            />
          )}
        </div>
      </div>

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
  )
}
