import { useVisualizationData } from './VisualizationDataProvider'
import AuthorityNetworkGraph from './AuthorityNetworkGraph'
import NetworkVisualization3D from './NetworkVisualization3D_Simple'

export default function SimpleVisualizationTest() {
  const { globalNetworkData, loading, errors } = useVisualizationData()

  if (loading) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-bold mb-2">🔄 Loading Visualization Test</h3>
        <p className="text-blue-700">Loading network data...</p>
      </div>
    )
  }

  if (errors.length > 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-bold mb-2">❌ Visualization Test Errors</h3>
        <ul className="text-red-700 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (!globalNetworkData || globalNetworkData.nodes.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-bold mb-2">⚠️ No Network Data</h3>
        <p className="text-yellow-700">No network data available for visualization.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">✅ Visualization Test Results</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{globalNetworkData.nodes.length}</div>
            <div className="text-sm text-green-600">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{globalNetworkData.links.length}</div>
            <div className="text-sm text-green-600">Links</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {[...new Set(globalNetworkData.nodes.map(n => n.type))].length}
            </div>
            <div className="text-sm text-green-600">Node Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {[...new Set(globalNetworkData.links.map(l => l.type))].length}
            </div>
            <div className="text-sm text-green-600">Link Types</div>
          </div>
        </div>

        <div className="text-sm text-green-700 space-y-1">
          <p><strong>Node Types:</strong> {[...new Set(globalNetworkData.nodes.map(n => n.type))].join(', ')}</p>
          <p><strong>Link Types:</strong> {[...new Set(globalNetworkData.links.map(l => l.type))].join(', ')}</p>
        </div>
      </div>

      {/* D3.js 2D Visualization Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">🎨 D3.js 2D Network Test</h4>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <AuthorityNetworkGraph 
            data={globalNetworkData} 
            width={600} 
            height={400} 
          />
        </div>
      </div>

      {/* Three.js 3D Visualization Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">🎮 Three.js 3D Network Test</h4>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <NetworkVisualization3D 
            data={globalNetworkData} 
            width={600} 
            height={400} 
          />
        </div>
      </div>

      {/* Sample Data Display */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">🔍 Sample Data</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium mb-2">Sample Nodes (first 3):</h5>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
              {JSON.stringify(globalNetworkData.nodes.slice(0, 3), null, 2)}
            </pre>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Sample Links (first 3):</h5>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
              {JSON.stringify(globalNetworkData.links.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
