import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { generateNetworkData, generateFocusedNetworkData } from '../../lib/graphDataGenerator'
import { processRootNodeVisualization } from '../../lib/rootNodeProcessor'
import { sortNetworkNodes, SORTING_METHODS } from '../../lib/visualizationSorting'

// Visualization Data Context
const VisualizationDataContext = createContext()

// Custom hook to use visualization data
export const useVisualizationData = () => {
  const context = useContext(VisualizationDataContext)
  if (!context) {
    throw new Error('useVisualizationData must be used within a VisualizationDataProvider')
  }
  return context
}

// Entity-specific data generators for focused views
const generateEntityFocusedData = (entityType, entityId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData

  console.log(`🎯 Generating ${entityType} focused data for ID: ${entityId}`)

  switch (entityType) {
    case 'company':
      return generateCompanyFocusedData(entityId, allData)
    case 'authority':
      return generateAuthorityFocusedData(entityId, allData)
    case 'jobSeeker':
      return generateJobSeekerFocusedData(entityId, allData)
    case 'skill':
      return generateSkillFocusedData(entityId, allData)
    case 'position':
      return generatePositionFocusedData(entityId, allData)
    case 'match':
      return generateMatchFocusedData(entityId, allData)
    default:
      return { nodes: [], links: [], stats: {} }
  }
}

// Company-focused network data
const generateCompanyFocusedData = (companyId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const company = companies.find(c => c.id === companyId)
  if (!company) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Add company node
  nodes.push({
    id: company.id,
    name: company.name,
    type: 'company',
    size: 20,
    color: '#3b82f6',
    central: true
  })

  // Add related authorities
  const companyAuthorities = hiringAuthorities.filter(auth => auth.company_id === companyId)
  companyAuthorities.forEach(auth => {
    nodes.push({
      id: auth.id,
      name: auth.name,
      type: 'authority',
      size: 15,
      color: '#10b981'
    })

    links.push({
      source: company.id,
      target: auth.id,
      type: 'employment',
      strength: 0.8,
      label: 'employs'
    })
  })

  // Add related positions
  const companyPositions = positions.filter(pos => pos.company_id === companyId)
  companyPositions.forEach(pos => {
    nodes.push({
      id: pos.id,
      name: pos.title,
      type: 'position',
      size: 12,
      color: '#f59e0b'
    })

    links.push({
      source: company.id,
      target: pos.id,
      type: 'offers',
      strength: 0.7,
      label: 'offers'
    })
  })

  // Add matches involving this company
  const companyMatches = matches.filter(match =>
    companyAuthorities.some(auth => auth.id === match.hiring_authority_id)
  )

  companyMatches.forEach(match => {
    const jobSeeker = jobSeekers.find(js => js.id === match.job_seeker_id)
    if (jobSeeker) {
      // Add job seeker if not already added
      if (!nodes.find(n => n.id === jobSeeker.id)) {
        nodes.push({
          id: jobSeeker.id,
          name: jobSeeker.name,
          type: 'jobSeeker',
          size: 10,
          color: '#8b5cf6'
        })
      }

      // Link to hiring authority
      const authority = hiringAuthorities.find(auth => auth.id === match.hiring_authority_id)
      if (authority) {
        links.push({
          source: authority.id,
          target: jobSeeker.id,
          type: 'match',
          strength: match.compatibility_score || 0.5,
          label: `${Math.round((match.compatibility_score || 0.5) * 100)}% match`
        })
      }
    }
  })

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      authorities: companyAuthorities.length,
      positions: companyPositions.length,
      matches: companyMatches.length
    }
  }
}

// Authority-focused network data
const generateAuthorityFocusedData = (authorityId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const authority = hiringAuthorities.find(auth => auth.id === authorityId)
  if (!authority) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Add authority node
  nodes.push({
    id: authority.id,
    name: authority.name,
    type: 'authority',
    size: 18,
    color: '#10b981',
    central: true
  })

  // Add company
  const company = companies.find(c => c.id === authority.company_id)
  if (company) {
    nodes.push({
      id: company.id,
      name: company.name,
      type: 'company',
      size: 16,
      color: '#3b82f6'
    })

    links.push({
      source: company.id,
      target: authority.id,
      type: 'employment',
      strength: 0.9,
      label: 'employs'
    })
  }

  // Add matches
  const authorityMatches = matches.filter(match => match.hiring_authority_id === authorityId)
  authorityMatches.forEach(match => {
    const jobSeeker = jobSeekers.find(js => js.id === match.job_seeker_id)
    if (jobSeeker) {
      nodes.push({
        id: jobSeeker.id,
        name: jobSeeker.name,
        type: 'jobSeeker',
        size: 12,
        color: '#8b5cf6'
      })

      links.push({
        source: authority.id,
        target: jobSeeker.id,
        type: 'match',
        strength: match.compatibility_score || 0.5,
        label: `${Math.round((match.compatibility_score || 0.5) * 100)}% match`
      })
    }
  })

  // Add desired skills
  if (authority.desired_skills) {
    authority.desired_skills.forEach(skillName => {
      const skill = skills.find(s => s.name === skillName)
      if (skill) {
        nodes.push({
          id: skill.id,
          name: skill.name,
          type: 'skill',
          size: 8,
          color: '#ef4444'
        })

        links.push({
          source: authority.id,
          target: skill.id,
          type: 'seeks',
          strength: 0.6,
          label: 'seeks'
        })
      }
    })
  }

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      matches: authorityMatches.length,
      desiredSkills: authority.desired_skills?.length || 0
    }
  }
}

// Job Seeker-focused network data
const generateJobSeekerFocusedData = (jobSeekerId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const jobSeeker = jobSeekers.find(js => js.id === jobSeekerId)
  if (!jobSeeker) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Add job seeker node
  nodes.push({
    id: jobSeeker.id,
    name: jobSeeker.name,
    type: 'jobSeeker',
    size: 18,
    color: '#8b5cf6',
    central: true
  })

  // Add skills
  if (jobSeeker.skills) {
    jobSeeker.skills.forEach(skillName => {
      const skill = skills.find(s => s.name === skillName)
      if (skill) {
        nodes.push({
          id: skill.id,
          name: skill.name,
          type: 'skill',
          size: 10,
          color: '#ef4444'
        })

        links.push({
          source: jobSeeker.id,
          target: skill.id,
          type: 'has',
          strength: 0.7,
          label: 'has skill'
        })
      }
    })
  }

  // Add matches
  const jobSeekerMatches = matches.filter(match => match.job_seeker_id === jobSeekerId)
  jobSeekerMatches.forEach(match => {
    const authority = hiringAuthorities.find(auth => auth.id === match.hiring_authority_id)
    if (authority) {
      nodes.push({
        id: authority.id,
        name: authority.name,
        type: 'authority',
        size: 14,
        color: '#10b981'
      })

      links.push({
        source: jobSeeker.id,
        target: authority.id,
        type: 'match',
        strength: match.compatibility_score || 0.5,
        label: `${Math.round((match.compatibility_score || 0.5) * 100)}% match`
      })

      // Add company
      const company = companies.find(c => c.id === authority.company_id)
      if (company && !nodes.find(n => n.id === company.id)) {
        nodes.push({
          id: company.id,
          name: company.name,
          type: 'company',
          size: 12,
          color: '#3b82f6'
        })

        links.push({
          source: company.id,
          target: authority.id,
          type: 'employment',
          strength: 0.8,
          label: 'employs'
        })
      }
    }
  })

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      skills: jobSeeker.skills?.length || 0,
      matches: jobSeekerMatches.length
    }
  }
}

// Skill-focused, Position-focused, and Match-focused generators
const generateSkillFocusedData = (skillId, allData) => {
  // Implementation for skill-focused view
  return { nodes: [], links: [], stats: {} }
}

const generatePositionFocusedData = (positionId, allData) => {
  // Implementation for position-focused view
  return { nodes: [], links: [], stats: {} }
}

const generateMatchFocusedData = (matchId, allData) => {
  // Implementation for match-focused view
  return { nodes: [], links: [], stats: {} }
}

export default function VisualizationDataProvider({ children }) {
  const [rawData, setRawData] = useState({
    companies: [],
    hiringAuthorities: [],
    jobSeekers: [],
    skills: [],
    positions: [],
    matches: []
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState([])

  // Fetch all data with cache busting
  const fetchAllData = async () => {
    console.log('🔄 VisualizationDataProvider: Fetching all data...')
    setLoading(true)
    setErrors([])

    try {
      const endpoints = ['companies', 'hiring-authorities', 'job-seekers', 'skills', 'positions', 'matches']
      const timestamp = Date.now()

      const promises = endpoints.map(endpoint =>
        fetch(`/api/${endpoint}?_t=${timestamp}`)
          .then(res => {
            console.log(`📡 ${endpoint} response:`, res.status)
            if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`)
            return res.json()
          })
          .then(data => ({ endpoint, data }))
          .catch(error => ({ endpoint, error: error.message }))
      )

      const results = await Promise.all(promises)
      const newData = { ...rawData }
      const fetchErrors = []

      results.forEach(({ endpoint, data, error }) => {
        if (error) {
          fetchErrors.push(`${endpoint}: ${error}`)
        } else {
          const key = endpoint === 'hiring-authorities' ? 'hiringAuthorities' :
                     endpoint === 'job-seekers' ? 'jobSeekers' : endpoint

          // Handle different API response formats
          let extractedData = data || []
          if (endpoint === 'hiring-authorities' && data?.authorities) {
            extractedData = data.authorities
          } else if (endpoint === 'matches' && data?.matches) {
            extractedData = data.matches
          }

          newData[key] = extractedData
          console.log(`✅ Fetched ${endpoint}:`, extractedData?.length || 0, 'items')
        }
      })

      setRawData(newData)
      setErrors(fetchErrors)
      setLoading(false)

      console.log('✅ VisualizationDataProvider: All data fetched:', {
        companies: newData.companies.length,
        hiringAuthorities: newData.hiringAuthorities.length,
        jobSeekers: newData.jobSeekers.length,
        skills: newData.skills.length,
        positions: newData.positions.length,
        matches: newData.matches.length,
        errors: fetchErrors.length
      })

    } catch (error) {
      console.error('❌ VisualizationDataProvider: Fetch failed:', error)
      setErrors([error.message])
      setLoading(false)
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Generate global network data
  const globalNetworkData = useMemo(() => {
    if (loading || rawData.companies.length === 0) {
      return { nodes: [], links: [], stats: {} }
    }

    console.log('🌐 Generating global network data...')
    return generateNetworkData(
      rawData.companies,
      rawData.hiringAuthorities,
      rawData.jobSeekers,
      rawData.skills,
      rawData.positions,
      rawData.matches
    )
  }, [rawData, loading])

  // Enhanced visualization data generation with root node processing
  const generateEnhancedVisualization = useMemo(() => {
    return (rootNodeId, options = {}) => {
      if (loading || !rootNodeId || globalNetworkData.nodes.length === 0) {
        return { nodes: [], links: [], stats: {} }
      }

      const {
        sortMethod = SORTING_METHODS.RELATIONSHIP_STRENGTH,
        maxDistance = 3,
        layoutType = 'force',
        filters = {}
      } = options

      console.log('🎯 Generating enhanced visualization for root:', rootNodeId)

      // Process with root node emphasis
      const processedData = processRootNodeVisualization(
        globalNetworkData,
        rootNodeId,
        { maxDistance, layoutType, ...options }
      )

      // Apply sorting to nodes
      const sortedNodes = sortNetworkNodes(
        processedData.nodes,
        processedData.links,
        rootNodeId,
        sortMethod,
        { ...filters, maxResults: filters.maxResults }
      )

      return {
        ...processedData,
        nodes: sortedNodes,
        sortMethod,
        options
      }
    }
  }, [globalNetworkData, loading])

  // Context value
  const value = {
    // Raw data
    rawData,
    loading,
    errors,

    // Global network data
    globalNetworkData,

    // Enhanced visualization generation
    generateEnhancedVisualization,

    // Data fetching
    fetchAllData,

    // Entity-focused data generation (legacy support)
    generateEntityFocusedData: (entityType, entityId) =>
      generateEntityFocusedData(entityType, entityId, rawData),

    // Entity lists for exploration
    entities: {
      companies: rawData.companies,
      authorities: rawData.hiringAuthorities,
      jobSeekers: rawData.jobSeekers,
      skills: rawData.skills,
      positions: rawData.positions,
      matches: rawData.matches
    },

    // Sorting methods and utilities
    sortingMethods: SORTING_METHODS
  }

  return (
    <VisualizationDataContext.Provider value={value}>
      {children}
    </VisualizationDataContext.Provider>
  )
}
