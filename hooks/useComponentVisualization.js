// Component-specific visualization hook for focused, 2-level edge visualizations
// Provides each page component with its own context-aware visualization data

import { useState, useEffect, useMemo } from 'react'
import { useVisualizationData } from '../components/visualizations/VisualizationDataProvider'
import { processRootNodeVisualization } from '../lib/rootNodeProcessor'

/**
 * Hook for component-specific visualizations with 2-level edge limiting
 * @param {string} componentType - Type of component (company, authority, jobSeeker, skill, position, match)
 * @param {string} entityId - ID of the focused entity (optional)
 * @param {Object} options - Visualization options
 * @returns {Object} Component-specific visualization data and controls
 */
export function useComponentVisualization(componentType, entityId = null, options = {}) {
  const {
    rawData,
    loading,
    errors,
    globalNetworkData,
    generateEntityFocusedData,
    generateEnhancedVisualization
  } = useVisualizationData()

  const [selectedEntity, setSelectedEntity] = useState(entityId)
  const [visualizationMode, setVisualizationMode] = useState('2D')
  const [showVisualization, setShowVisualization] = useState(false)

  // Default options for component-specific visualizations
  const defaultOptions = {
    maxDistance: 2, // Enforce 2-level edge limit
    layoutType: 'radial',
    emphasisMultiplier: 2.0,
    showSecondaryConnections: true,
    ...options
  }

  // Generate focused visualization data for the component
  const focusedData = useMemo(() => {
    if (loading || !selectedEntity) {
      return { nodes: [], links: [], stats: {} }
    }

    // Use entity-focused data generation
    const entityData = generateEntityFocusedData(componentType, selectedEntity)
    
    // Apply root node processing with 2-level edge limit
    if (entityData.nodes.length > 0) {
      return processRootNodeVisualization(entityData, selectedEntity, defaultOptions)
    }

    return entityData
  }, [componentType, selectedEntity, rawData, loading, defaultOptions])

  // Get available entities for the component type
  const availableEntities = useMemo(() => {
    if (loading) return []

    switch (componentType) {
      case 'company':
        return rawData.companies.map(c => ({
          id: c.id || c._key,
          name: c.name,
          type: 'company'
        }))
      case 'authority':
        return rawData.hiringAuthorities.map(a => ({
          id: a.id || a._key,
          name: a.name,
          type: 'authority'
        }))
      case 'jobSeeker':
        return rawData.jobSeekers.map(js => ({
          id: js.id || js._key,
          name: js.name,
          type: 'jobSeeker'
        }))
      case 'skill':
        return rawData.skills.map(s => ({
          id: s.id || s._key,
          name: s.name,
          type: 'skill'
        }))
      case 'position':
        return rawData.positions.map(p => ({
          id: p.id || p._key,
          name: p.title,
          type: 'position'
        }))
      case 'match':
        return rawData.matches.map(m => ({
          id: m.id || m._key,
          name: `Match ${m.score || 50}%`,
          type: 'match'
        }))
      default:
        return []
    }
  }, [componentType, rawData, loading])

  // Auto-select first entity if none selected
  useEffect(() => {
    if (!selectedEntity && availableEntities.length > 0) {
      setSelectedEntity(availableEntities[0].id)
    }
  }, [selectedEntity, availableEntities])

  // Component-specific visualization controls
  const controls = {
    // Entity selection
    selectedEntity,
    setSelectedEntity,
    availableEntities,

    // Visualization mode
    visualizationMode,
    setVisualizationMode,
    
    // Modal controls
    showVisualization,
    setShowVisualization,
    openVisualization: () => setShowVisualization(true),
    closeVisualization: () => setShowVisualization(false),

    // Quick actions
    switchToEntity: (entityId) => {
      setSelectedEntity(entityId)
      setShowVisualization(true)
    },
    
    // Context switching (for related entities)
    switchContext: (newEntityType, newEntityId) => {
      // This would be used to switch between related entities
      // e.g., from a company to one of its hiring authorities
      console.log(`Context switch: ${newEntityType}/${newEntityId}`)
    }
  }

  // Component-specific stats
  const componentStats = useMemo(() => {
    if (!focusedData.stats) return {}

    return {
      ...focusedData.stats,
      componentType,
      selectedEntityName: availableEntities.find(e => e.id === selectedEntity)?.name || 'Unknown',
      edgeLevels: 2,
      totalAvailableEntities: availableEntities.length
    }
  }, [focusedData.stats, componentType, selectedEntity, availableEntities])

  return {
    // Data
    focusedData,
    rawData,
    loading,
    errors,

    // Controls
    controls,

    // Stats
    stats: componentStats,

    // Utilities
    isReady: !loading && selectedEntity && focusedData.nodes.length > 0,
    hasData: availableEntities.length > 0,
    
    // Component type info
    componentType,
    entityId: selectedEntity
  }
}

/**
 * Specialized hooks for each component type
 */

export function useCompanyVisualization(companyId, options = {}) {
  return useComponentVisualization('company', companyId, options)
}

export function useAuthorityVisualization(authorityId, options = {}) {
  return useComponentVisualization('authority', authorityId, options)
}

export function useJobSeekerVisualization(jobSeekerId, options = {}) {
  return useComponentVisualization('jobSeeker', jobSeekerId, options)
}

export function useSkillVisualization(skillId, options = {}) {
  return useComponentVisualization('skill', skillId, options)
}

export function usePositionVisualization(positionId, options = {}) {
  return useComponentVisualization('position', positionId, options)
}

export function useMatchVisualization(matchId, options = {}) {
  return useComponentVisualization('match', matchId, options)
}

/**
 * Hook for page-level visualization integration
 * Provides common visualization UI patterns for pages
 */
export function usePageVisualization(componentType, options = {}) {
  const visualization = useComponentVisualization(componentType, null, options)
  
  // Page-specific UI helpers
  const pageHelpers = {
    // Render visualization button
    renderVisualizationButton: (className = '') => (
      <button
        onClick={visualization.controls.openVisualization}
        disabled={!visualization.isReady}
        className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 ${className}`}
      >
        🌐 Visualize Network
      </button>
    ),

    // Render entity selector
    renderEntitySelector: (className = '') => (
      <select
        value={visualization.controls.selectedEntity || ''}
        onChange={(e) => visualization.controls.setSelectedEntity(e.target.value)}
        className={`border border-gray-300 rounded-lg px-3 py-2 ${className}`}
      >
        <option value="">Select {componentType}...</option>
        {visualization.controls.availableEntities.map(entity => (
          <option key={entity.id} value={entity.id}>
            {entity.name}
          </option>
        ))}
      </select>
    ),

    // Get visualization modal props
    getModalProps: () => ({
      isOpen: visualization.controls.showVisualization,
      onClose: visualization.controls.closeVisualization,
      data: visualization.focusedData,
      title: `${componentType} Network - ${visualization.stats.selectedEntityName}`,
      stats: visualization.stats
    })
  }

  return {
    ...visualization,
    pageHelpers
  }
}

export default useComponentVisualization
