import { useState, useMemo } from 'react'
import { useVisualizationData } from './VisualizationDataProvider'
import GraphCard from './GraphCard'

const ENTITY_CONFIGS = {
  companies: {
    title: 'Companies',
    icon: '🏢',
    description: 'Explore company networks and their hiring authorities',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-500',
    textColor: 'text-blue-700'
  },
  authorities: {
    title: 'Hiring Authorities',
    icon: '👥',
    description: 'View hiring authority connections and matches',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-500',
    textColor: 'text-green-700'
  },
  jobSeekers: {
    title: 'Job Seekers',
    icon: '🎯',
    description: 'Discover job seeker skills and potential matches',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-500',
    textColor: 'text-purple-700'
  },
  skills: {
    title: 'Skills',
    icon: '⚡',
    description: 'Analyze skill networks and demand patterns',
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-500',
    textColor: 'text-red-700'
  },
  positions: {
    title: 'Positions',
    icon: '💼',
    description: 'Examine position requirements and connections',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-500',
    textColor: 'text-yellow-700'
  },
  matches: {
    title: 'Matches',
    icon: '🎪',
    description: 'Explore successful matches and compatibility',
    color: 'bg-pink-50 border-pink-200',
    headerColor: 'bg-pink-500',
    textColor: 'text-pink-700'
  }
}

export default function GraphExplorerGrid() {
  const { entities, loading, generateEntityFocusedData } = useVisualizationData()
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedEntityType, setSelectedEntityType] = useState(null)

  // Generate preview data for each entity type
  const entityPreviews = useMemo(() => {
    if (loading) return {}

    const previews = {}
    
    Object.keys(ENTITY_CONFIGS).forEach(entityType => {
      const entityList = entities[entityType] || []
      if (entityList.length > 0) {
        // Generate preview data for the first few entities
        const previewEntities = entityList.slice(0, 3)
        previews[entityType] = previewEntities.map(entity => ({
          entity,
          networkData: generateEntityFocusedData(
            entityType.slice(0, -1), // Remove 's' from plural
            entity.id
          )
        }))
      }
    })

    return previews
  }, [entities, loading, generateEntityFocusedData])

  const handleEntitySelect = (entityType, entity) => {
    setSelectedEntityType(entityType)
    setSelectedEntity(entity)
  }

  const handleCloseDetail = () => {
    setSelectedEntity(null)
    setSelectedEntityType(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading graph explorer...</p>
        </div>
      </div>
    )
  }

  // Detail view for selected entity
  if (selectedEntity && selectedEntityType) {
    const config = ENTITY_CONFIGS[selectedEntityType]
    const networkData = generateEntityFocusedData(
      selectedEntityType.slice(0, -1),
      selectedEntity.id
    )

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCloseDetail}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Explorer</span>
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedEntity.name || selectedEntity.title}
                </h2>
                <p className="text-sm text-gray-600">{config.title} Network View</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed graph view */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <GraphCard
            networkData={networkData}
            title={`${selectedEntity.name || selectedEntity.title} Network`}
            config={config}
            size="large"
            showStats={true}
          />
        </div>
      </div>
    )
  }

  // Grid view of all entity types
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Graph Explorer</h2>
        <p className="text-gray-600">
          Explore connections from different perspectives. Click on any entity to dive deeper.
        </p>
      </div>

      {/* Entity type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(ENTITY_CONFIGS).map(([entityType, config]) => {
          const entityList = entities[entityType] || []
          const previews = entityPreviews[entityType] || []

          return (
            <div
              key={entityType}
              className={`${config.color} rounded-xl border-2 p-6 transition-all hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`${config.headerColor} text-white p-2 rounded-lg text-xl`}>
                  {config.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${config.textColor}`}>{config.title}</h3>
                  <p className="text-sm text-gray-600">{entityList.length} items</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{config.description}</p>

              {/* Preview entities */}
              {previews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Sample Networks:</h4>
                  {previews.map(({ entity, networkData }, index) => (
                    <div
                      key={entity.id}
                      onClick={() => handleEntitySelect(entityType, entity)}
                      className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {entity.name || entity.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {networkData.nodes.length} nodes
                        </span>
                      </div>
                      
                      {/* Mini graph preview */}
                      <div className="h-16 bg-gray-50 rounded border relative overflow-hidden">
                        <GraphCard
                          networkData={networkData}
                          config={config}
                          size="mini"
                          interactive={false}
                        />
                      </div>
                      
                      {/* Stats */}
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{networkData.links.length} connections</span>
                        <span>Click to explore →</span>
                      </div>
                    </div>
                  ))}

                  {/* View all button */}
                  {entityList.length > 3 && (
                    <button className={`w-full py-2 px-4 ${config.headerColor} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}>
                      View All {entityList.length} {config.title}
                    </button>
                  )}
                </div>
              )}

              {/* Empty state */}
              {entityList.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No {config.title.toLowerCase()} available</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Global stats */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Network Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ENTITY_CONFIGS).map(([entityType, config]) => {
            const count = entities[entityType]?.length || 0
            return (
              <div key={entityType} className="text-center">
                <div className={`${config.headerColor} text-white p-3 rounded-lg text-xl mb-2 mx-auto w-fit`}>
                  {config.icon}
                </div>
                <div className="font-bold text-lg text-gray-900">{count}</div>
                <div className="text-xs text-gray-600">{config.title}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
