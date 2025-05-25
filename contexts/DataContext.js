import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

// Data Context for single source of truth
const DataContext = createContext()

// Action types
const DATA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DATA: 'SET_DATA',
  UPDATE_ENTITY: 'UPDATE_ENTITY',
  ADD_ENTITY: 'ADD_ENTITY',
  DELETE_ENTITY: 'DELETE_ENTITY',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial state
const initialState = {
  // Data collections
  companies: [],
  hiringAuthorities: [],
  jobSeekers: [],
  skills: [],
  positions: [],
  matches: [],
  
  // Loading states
  loading: {
    companies: false,
    hiringAuthorities: false,
    jobSeekers: false,
    skills: false,
    positions: false,
    matches: false,
    global: false
  },
  
  // Error states
  errors: {
    companies: null,
    hiringAuthorities: null,
    jobSeekers: null,
    skills: null,
    positions: null,
    matches: null,
    global: null
  },
  
  // Metadata
  lastUpdated: {},
  stats: {
    totalCompanies: 0,
    totalAuthorities: 0,
    totalJobSeekers: 0,
    totalSkills: 0,
    totalPositions: 0,
    totalMatches: 0,
    skillConnections: 0
  }
}

// Reducer function
function dataReducer(state, action) {
  switch (action.type) {
    case DATA_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.loading,
          global: action.entity === 'global' ? action.loading : state.loading.global
        }
      }
      
    case DATA_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: action.error
        },
        loading: {
          ...state.loading,
          [action.entity]: false
        }
      }
      
    case DATA_ACTIONS.SET_DATA:
      const newStats = calculateStats({
        ...state,
        [action.entity]: action.data
      })
      
      return {
        ...state,
        [action.entity]: action.data,
        lastUpdated: {
          ...state.lastUpdated,
          [action.entity]: new Date().toISOString()
        },
        loading: {
          ...state.loading,
          [action.entity]: false
        },
        errors: {
          ...state.errors,
          [action.entity]: null
        },
        stats: newStats
      }
      
    case DATA_ACTIONS.UPDATE_ENTITY:
      const updatedData = state[action.entity].map(item =>
        item.id === action.id || item._key === action.id ? { ...item, ...action.updates } : item
      )
      
      return {
        ...state,
        [action.entity]: updatedData,
        stats: calculateStats({
          ...state,
          [action.entity]: updatedData
        })
      }
      
    case DATA_ACTIONS.ADD_ENTITY:
      const newData = [...state[action.entity], action.data]
      
      return {
        ...state,
        [action.entity]: newData,
        stats: calculateStats({
          ...state,
          [action.entity]: newData
        })
      }
      
    case DATA_ACTIONS.DELETE_ENTITY:
      const filteredData = state[action.entity].filter(item =>
        item.id !== action.id && item._key !== action.id
      )
      
      return {
        ...state,
        [action.entity]: filteredData,
        stats: calculateStats({
          ...state,
          [action.entity]: filteredData
        })
      }
      
    case DATA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: null
        }
      }
      
    default:
      return state
  }
}

// Calculate statistics from current data
function calculateStats(state) {
  const jobSeekerSkills = state.jobSeekers.reduce((total, js) => total + (js.skills?.length || 0), 0)
  const authorityPreferences = state.hiringAuthorities.reduce((total, auth) => total + (auth.skillsLookingFor?.length || 0), 0)
  const positionRequirements = state.positions.reduce((total, pos) => total + (pos.requirements?.length || 0), 0)
  
  return {
    totalCompanies: state.companies.length,
    totalAuthorities: state.hiringAuthorities.length,
    totalJobSeekers: state.jobSeekers.length,
    totalSkills: state.skills.length,
    totalPositions: state.positions.length,
    totalMatches: state.matches.length,
    skillConnections: jobSeekerSkills + authorityPreferences + positionRequirements
  }
}

// Normalize data structure from API responses
function normalizeData(data, entity) {
  if (!data) return []
  
  // Handle different API response structures
  let normalizedData = Array.isArray(data) ? data : []
  
  // Ensure consistent ID field (use _key as id if available)
  return normalizedData.map(item => ({
    ...item,
    id: item.id || item._key,
    _key: item._key || item.id
  }))
}

// Data Provider Component
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)
  
  // Fetch data for a specific entity
  const fetchEntity = useCallback(async (entity) => {
    dispatch({ type: DATA_ACTIONS.SET_LOADING, entity, loading: true })
    
    try {
      const response = await fetch(`/api/${entity}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${entity}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const normalizedData = normalizeData(data, entity)
      
      dispatch({ 
        type: DATA_ACTIONS.SET_DATA, 
        entity: entity.replace('-', '').replace(/s$/, '') + 's', // Normalize entity name
        data: normalizedData 
      })
      
    } catch (error) {
      console.error(`Error fetching ${entity}:`, error)
      dispatch({ 
        type: DATA_ACTIONS.SET_ERROR, 
        entity: entity.replace('-', '').replace(/s$/, '') + 's',
        error: error.message 
      })
    }
  }, [])
  
  // Fetch all data
  const fetchAllData = useCallback(async () => {
    dispatch({ type: DATA_ACTIONS.SET_LOADING, entity: 'global', loading: true })
    
    try {
      const entities = ['companies', 'hiring-authorities', 'job-seekers', 'skills', 'positions', 'matches']
      
      // Fetch all entities in parallel
      await Promise.all(entities.map(entity => fetchEntity(entity)))
      
      dispatch({ type: DATA_ACTIONS.SET_LOADING, entity: 'global', loading: false })
      
    } catch (error) {
      console.error('Error fetching all data:', error)
      dispatch({ 
        type: DATA_ACTIONS.SET_ERROR, 
        entity: 'global', 
        error: 'Failed to fetch application data' 
      })
    }
  }, [fetchEntity])
  
  // Refresh specific entity
  const refreshEntity = useCallback((entity) => {
    return fetchEntity(entity)
  }, [fetchEntity])
  
  // Update entity
  const updateEntity = useCallback(async (entity, id, updates) => {
    try {
      const response = await fetch(`/api/${entity}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update ${entity}`)
      }
      
      const updatedData = await response.json()
      
      dispatch({
        type: DATA_ACTIONS.UPDATE_ENTITY,
        entity: entity.replace('-', '').replace(/s$/, '') + 's',
        id,
        updates: updatedData
      })
      
      return updatedData
      
    } catch (error) {
      console.error(`Error updating ${entity}:`, error)
      throw error
    }
  }, [])
  
  // Add entity
  const addEntity = useCallback(async (entity, data) => {
    try {
      const response = await fetch(`/api/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create ${entity}`)
      }
      
      const newData = await response.json()
      
      dispatch({
        type: DATA_ACTIONS.ADD_ENTITY,
        entity: entity.replace('-', '').replace(/s$/, '') + 's',
        data: { ...newData, id: newData.id || newData._key, _key: newData._key || newData.id }
      })
      
      return newData
      
    } catch (error) {
      console.error(`Error creating ${entity}:`, error)
      throw error
    }
  }, [])
  
  // Delete entity
  const deleteEntity = useCallback(async (entity, id) => {
    try {
      const response = await fetch(`/api/${entity}?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${entity}`)
      }
      
      dispatch({
        type: DATA_ACTIONS.DELETE_ENTITY,
        entity: entity.replace('-', '').replace(/s$/, '') + 's',
        id
      })
      
    } catch (error) {
      console.error(`Error deleting ${entity}:`, error)
      throw error
    }
  }, [])
  
  // Clear error
  const clearError = useCallback((entity) => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR, entity })
  }, [])
  
  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])
  
  const value = {
    // State
    ...state,
    
    // Actions
    fetchEntity,
    fetchAllData,
    refreshEntity,
    updateEntity,
    addEntity,
    deleteEntity,
    clearError,
    
    // Computed values
    isLoading: Object.values(state.loading).some(loading => loading),
    hasErrors: Object.values(state.errors).some(error => error !== null)
  }
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use data context
export function useData() {
  const context = useContext(DataContext)
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  
  return context
}

// Hook for specific entity data
export function useEntityData(entity) {
  const { [entity]: data, loading, errors, refreshEntity } = useData()
  
  return {
    data: data || [],
    loading: loading[entity] || false,
    error: errors[entity],
    refresh: () => refreshEntity(entity)
  }
}
