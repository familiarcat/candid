import { useState, useMemo } from 'react'
import GraphVisualization2D from './GraphVisualization2D'
import GraphVisualization3D from './GraphVisualization3D'
import EnhancedVisualizationControls from './EnhancedVisualizationControls'
import VisualizationLegend from './VisualizationLegend'
import MatchRelevancePanel from './MatchRelevancePanel'
import { SORTING_METHODS } from '../lib/visualizationSorting'
import { processRootNodeVisualization } from '../lib/rootNodeProcessor'

export default function VisualizationModal({
  isOpen,
  onClose,
  data,
  title,
  stats = {},
  rootNodeId = null
}) {
  const [viewMode, setViewMode] = useState('2D')
  const [edgeDepth, setEdgeDepth] = useState(2)
  const [sortMethod, setSortMethod] = useState(SORTING_METHODS.RELATIONSHIP_STRENGTH)
  const [showMatchReasons, setShowMatchReasons] = useState(true)
  const [filters, setFilters] = useState({
    showCompanies: true,
    showAuthorities: true,
    showJobSeekers: true,
    showSkills: true,
    showPositions: true
  })

  // Process data with current settings
  const processedData = useMemo(() => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      return { nodes: [], links: [], stats: {} }
    }

    // Apply edge depth limiting and sorting
    const processed = processRootNodeVisualization(data, rootNodeId, {
      maxDistance: edgeDepth,
      sortMethod,
      filters,
      layoutType: 'radial'
    })

    return processed
  }, [data, rootNodeId, edgeDepth, sortMethod, filters])

  // Extract match relevance information
  const matchRelevance = useMemo(() => {
    if (!processedData.links) return []

    return processedData.links
      .filter(link => link.type === 'match' || link.type === 'matched_to')
      .map(link => ({
        source: processedData.nodes.find(n => n.id === (link.source?.id || link.source)),
        target: processedData.nodes.find(n => n.id === (link.target?.id || link.target)),
        score: link.score || link.matchScore || 0,
        reasons: link.matchReasons || [],
        strength: link.strength || 0.5,
        label: link.label || ''
      }))
      .sort((a, b) => b.score - a.score)
  }, [processedData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-2 px-2 pb-2 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Enhanced Modal with Better Layout */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-4 sm:align-middle sm:max-w-7xl sm:w-full max-h-[95vh] flex flex-col">

          {/* Header with Controls */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Title and Close */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl leading-6 font-semibold text-gray-900">
                  {title || 'Network Visualization'}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={onClose}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Controls - Fixed Width Issue */}
              <div className="w-full overflow-x-auto">
                <EnhancedVisualizationControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  edgeDepth={edgeDepth}
                  onEdgeDepthChange={setEdgeDepth}
                  sortMethod={sortMethod}
                  onSortMethodChange={setSortMethod}
                  filters={filters}
                  onFiltersChange={setFilters}
                  showMatchReasons={showMatchReasons}
                  onShowMatchReasonsChange={setShowMatchReasons}
                  compact={true}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Visualization Area */}
            <div className="flex-1 bg-gray-50 relative">
              <div className="absolute inset-0">
                {viewMode === '2D' ? (
                  <GraphVisualization2D
                    data={processedData}
                    rootNodeId={rootNodeId}
                    enableInteraction={true}
                    showMatchReasons={showMatchReasons}
                  />
                ) : (
                  <GraphVisualization3D
                    data={processedData}
                    rootNodeId={rootNodeId}
                    enableInteraction={true}
                    showMatchReasons={showMatchReasons}
                  />
                )}
              </div>

              {/* Legend Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <VisualizationLegend
                  compact={true}
                  showShapes={viewMode === '3D'}
                />
              </div>
            </div>

            {/* Match Relevance Panel */}
            {showMatchReasons && matchRelevance.length > 0 && (
              <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                <MatchRelevancePanel
                  matches={matchRelevance}
                  stats={stats}
                />
              </div>
            )}
          </div>

          {/* Footer with Stats */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex space-x-6">
                <span>{processedData.nodes?.length || 0} nodes</span>
                <span>{processedData.links?.length || 0} connections</span>
                <span>Depth: {edgeDepth} levels</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {sortMethod.replace('_', ' ').toLowerCase()}
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  {viewMode} view
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}