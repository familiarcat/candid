import { useVisualizationData } from './VisualizationDataProvider'

export default function VisualizationDebugger() {
  const { rawData, globalNetworkData, loading, errors } = useVisualizationData()

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-bold mb-4">🔍 Visualization Debug Info</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Status */}
        <div>
          <h4 className="font-semibold mb-2">📊 Data Status</h4>
          <div className="space-y-1 text-sm">
            <p>Loading: <span className={loading ? 'text-red-600' : 'text-green-600'}>{loading.toString()}</span></p>
            <p>Errors: <span className={errors.length > 0 ? 'text-red-600' : 'text-green-600'}>{errors.length}</span></p>
            <p>Companies: <span className="font-mono">{rawData.companies.length}</span></p>
            <p>Authorities: <span className="font-mono">{rawData.hiringAuthorities.length}</span></p>
            <p>Job Seekers: <span className="font-mono">{rawData.jobSeekers.length}</span></p>
            <p>Skills: <span className="font-mono">{rawData.skills.length}</span></p>
            <p>Positions: <span className="font-mono">{rawData.positions.length}</span></p>
            <p>Matches: <span className="font-mono">{rawData.matches.length}</span></p>
          </div>
        </div>

        {/* Network Data */}
        <div>
          <h4 className="font-semibold mb-2">🕸️ Network Data</h4>
          <div className="space-y-1 text-sm">
            <p>Nodes: <span className="font-mono">{globalNetworkData.nodes.length}</span></p>
            <p>Links: <span className="font-mono">{globalNetworkData.links.length}</span></p>
            <p>Node Types: <span className="font-mono">
              {[...new Set(globalNetworkData.nodes.map(n => n.type))].join(', ')}
            </span></p>
            <p>Link Types: <span className="font-mono">
              {[...new Set(globalNetworkData.links.map(l => l.type))].join(', ')}
            </span></p>
          </div>
        </div>
      </div>

      {/* Sample Data */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">🔬 Sample Network Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium mb-1">Sample Nodes (first 3):</h5>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify(globalNetworkData.nodes.slice(0, 3), null, 2)}
            </pre>
          </div>
          <div>
            <h5 className="text-sm font-medium mb-1">Sample Links (first 3):</h5>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify(globalNetworkData.links.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2 text-red-600">❌ Errors</h4>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
