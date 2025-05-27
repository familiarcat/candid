import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { generateNetworkData, generateFocusedNetworkData } from '../../lib/graphDataGenerator'
import { processRootNodeVisualization } from '../../lib/rootNodeProcessor'
import { sortNetworkNodes, SORTING_METHODS } from '../../lib/visualizationSorting'
import {
  visualizationCache,
  optimizeNetworkData,
  performanceMonitor,
  memoize
} from '../../lib/performanceOptimizations'

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
    color: '#8b5cf6', // purple - FIXED
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
      color: '#8b5cf6' // purple - FIXED
    })

    links.push({
      source: company.id,
      target: authority.id,
      type: 'employment',
      strength: 0.9,
      label: 'employs'
    })
  }

  // Add matches (fix data contract)
  const authorityMatches = matches.filter(match =>
    match.hiringAuthorityId === `hiringAuthorities/${authorityId}` ||
    match.hiringAuthorityId?.split('/')[1] === authorityId ||
    match.hiring_authority_id === authorityId
  )
  authorityMatches.forEach(match => {
    const jobSeeker = jobSeekers.find(js =>
      js.id === match.jobSeekerId?.split('/')[1] ||
      js._key === match.jobSeekerId?.split('/')[1] ||
      js.id === match.job_seeker_id
    )
    if (jobSeeker) {
      nodes.push({
        id: jobSeeker.id || jobSeeker._key,
        name: jobSeeker.name,
        type: 'jobSeeker',
        size: 12,
        color: '#8b5cf6'
      })

      links.push({
        source: authority.id || authority._key,
        target: jobSeeker.id || jobSeeker._key,
        type: 'match',
        strength: (match.score || match.compatibility_score || 50) / 100,
        label: `${Math.round(match.score || match.compatibility_score || 50)}% match`
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

  // Add matches (fix data contract)
  const jobSeekerMatches = matches.filter(match =>
    match.jobSeekerId === `jobSeekers/${jobSeekerId}` ||
    match.jobSeekerId?.split('/')[1] === jobSeekerId ||
    match.job_seeker_id === jobSeekerId
  )
  jobSeekerMatches.forEach(match => {
    const authority = hiringAuthorities.find(auth =>
      auth.id === match.hiringAuthorityId?.split('/')[1] ||
      auth._key === match.hiringAuthorityId?.split('/')[1] ||
      auth.id === match.hiring_authority_id
    )
    if (authority) {
      nodes.push({
        id: authority.id || authority._key,
        name: authority.name,
        type: 'authority',
        size: 14,
        color: '#10b981'
      })

      links.push({
        source: jobSeeker.id || jobSeeker._key,
        target: authority.id || authority._key,
        type: 'match',
        strength: (match.score || match.compatibility_score || 50) / 100,
        label: `${Math.round(match.score || match.compatibility_score || 50)}% match`
      })

      // Add company
      const company = companies.find(c =>
        c.id === match.companyId?.split('/')[1] ||
        c._key === match.companyId?.split('/')[1] ||
        c.id === authority.company_id ||
        c.name === authority.company
      )
      if (company && !nodes.find(n => n.id === (company.id || company._key))) {
        nodes.push({
          id: company.id || company._key,
          name: company.name,
          type: 'company',
          size: 12,
          color: '#8b5cf6' // purple - FIXED
        })

        links.push({
          source: company.id || company._key,
          target: authority.id || authority._key,
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

// Skill-focused network data (2-level edge limit)
const generateSkillFocusedData = (skillId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const skill = skills.find(s => s.id === skillId || s._key === skillId)
  if (!skill) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Add skill node (root)
  nodes.push({
    id: skill.id || skill._key,
    name: skill.name,
    type: 'skill',
    size: 18,
    color: '#f59e0b',
    central: true
  })

  // Level 1: Job seekers and positions that use this skill
  const skillUsers = jobSeekers.filter(js =>
    js.skills?.some(s => s === skill.name || s.toLowerCase() === skill.name.toLowerCase())
  )
  const skillPositions = positions.filter(pos =>
    pos.requirements?.some(req => req === skill.name || req.toLowerCase() === skill.name.toLowerCase())
  )

  // Add job seekers (Level 1)
  skillUsers.forEach(jobSeeker => {
    nodes.push({
      id: jobSeeker.id || jobSeeker._key,
      name: jobSeeker.name,
      type: 'jobSeeker',
      size: 14,
      color: '#8b5cf6'
    })

    links.push({
      source: skill.id || skill._key,
      target: jobSeeker.id || jobSeeker._key,
      type: 'has_skill',
      strength: 0.7,
      label: 'has skill'
    })
  })

  // Add positions (Level 1)
  skillPositions.forEach(position => {
    nodes.push({
      id: position.id || position._key,
      name: position.title,
      type: 'position',
      size: 14,
      color: '#10b981'
    })

    links.push({
      source: skill.id || skill._key,
      target: position.id || position._key,
      type: 'requires',
      strength: 0.8,
      label: 'requires'
    })

    // Level 2: Companies for these positions
    const company = companies.find(c =>
      c.id === position.companyId?.split('/')[1] ||
      c._key === position.companyId?.split('/')[1] ||
      c.name === position.company
    )
    if (company && !nodes.find(n => n.id === (company.id || company._key))) {
      nodes.push({
        id: company.id || company._key,
        name: company.name,
        type: 'company',
        size: 12,
        color: '#8b5cf6' // purple - FIXED
      })

      links.push({
        source: company.id || company._key,
        target: position.id || position._key,
        type: 'posts',
        strength: 0.6,
        label: 'posts'
      })
    }
  })

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      jobSeekers: skillUsers.length,
      positions: skillPositions.length,
      companies: new Set(skillPositions.map(p => p.company)).size
    }
  }
}

// Position-focused network data (2-level edge limit)
const generatePositionFocusedData = (positionId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const position = positions.find(p => p.id === positionId || p._key === positionId)
  if (!position) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Add position node (root)
  nodes.push({
    id: position.id || position._key,
    name: position.title,
    type: 'position',
    size: 18,
    color: '#10b981',
    central: true
  })

  // Level 1: Company that posted this position
  const company = companies.find(c =>
    c.id === position.companyId?.split('/')[1] ||
    c._key === position.companyId?.split('/')[1] ||
    c.name === position.company
  )
  if (company) {
    nodes.push({
      id: company.id || company._key,
      name: company.name,
      type: 'company',
      size: 16,
      color: '#8b5cf6' // purple - FIXED
    })

    links.push({
      source: company.id || company._key,
      target: position.id || position._key,
      type: 'posts',
      strength: 0.9,
      label: 'posts'
    })

    // Level 2: Hiring authorities at this company
    const companyAuthorities = hiringAuthorities.filter(auth =>
      auth.companyId === `companies/${company._key || company.id}` ||
      auth.company === company.name
    )
    companyAuthorities.forEach(authority => {
      nodes.push({
        id: authority.id || authority._key,
        name: authority.name,
        type: 'authority',
        size: 12,
        color: '#00d4ff' // cyan - FIXED
      })

      links.push({
        source: company.id || company._key,
        target: authority.id || authority._key,
        type: 'employs',
        strength: 0.7,
        label: 'employs'
      })
    })
  }

  // Level 1: Required skills
  if (position.requirements) {
    position.requirements.forEach(skillName => {
      const skill = skills.find(s => s.name === skillName)
      if (skill) {
        nodes.push({
          id: skill.id || skill._key,
          name: skill.name,
          type: 'skill',
          size: 14,
          color: '#10b981' // green - FIXED
        })

        links.push({
          source: position.id || position._key,
          target: skill.id || skill._key,
          type: 'requires',
          strength: 0.8,
          label: 'requires'
        })
      }
    })
  }

  // Level 1: Matched job seekers
  const positionMatches = matches.filter(match =>
    match.positionId === `positions/${position._key || position.id}`
  )
  positionMatches.forEach(match => {
    const jobSeeker = jobSeekers.find(js =>
      js.id === match.jobSeekerId?.split('/')[1] ||
      js._key === match.jobSeekerId?.split('/')[1]
    )
    if (jobSeeker && !nodes.find(n => n.id === (jobSeeker.id || jobSeeker._key))) {
      nodes.push({
        id: jobSeeker.id || jobSeeker._key,
        name: jobSeeker.name,
        type: 'jobSeeker',
        size: 12,
        color: '#f97316' // orange - FIXED
      })

      links.push({
        source: position.id || position._key,
        target: jobSeeker.id || jobSeeker._key,
        type: 'matched_to',
        strength: (match.score || 50) / 100,
        label: `${match.score || 50}% match`
      })
    }
  })

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      company: company?.name || 'Unknown',
      requiredSkills: position.requirements?.length || 0,
      matches: positionMatches.length
    }
  }
}

// Match-focused network data (2-level edge limit)
const generateMatchFocusedData = (matchId, allData) => {
  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = allData
  const match = matches.find(m => m.id === matchId || m._key === matchId)
  if (!match) return { nodes: [], links: [], stats: {} }

  const nodes = []
  const links = []

  // Get core entities
  const jobSeeker = jobSeekers.find(js =>
    js.id === match.jobSeekerId?.split('/')[1] ||
    js._key === match.jobSeekerId?.split('/')[1]
  )
  const authority = hiringAuthorities.find(auth =>
    auth.id === match.hiringAuthorityId?.split('/')[1] ||
    auth._key === match.hiringAuthorityId?.split('/')[1]
  )
  const company = companies.find(c =>
    c.id === match.companyId?.split('/')[1] ||
    c._key === match.companyId?.split('/')[1]
  )

  if (!jobSeeker || !authority) return { nodes: [], links: [], stats: {} }

  // Add core match nodes
  nodes.push({
    id: jobSeeker.id || jobSeeker._key,
    name: jobSeeker.name,
    type: 'jobSeeker',
    size: 16,
    color: '#f97316', // orange - FIXED
    central: true
  })

  nodes.push({
    id: authority.id || authority._key,
    name: authority.name,
    type: 'authority',
    size: 16,
    color: '#00d4ff', // cyan - FIXED
    central: true
  })

  // Core match link
  links.push({
    source: jobSeeker.id || jobSeeker._key,
    target: authority.id || authority._key,
    type: 'matched_to',
    strength: (match.score || 50) / 100,
    label: `${match.score || 50}% match`,
    central: true
  })

  // Level 1: Company
  if (company) {
    nodes.push({
      id: company.id || company._key,
      name: company.name,
      type: 'company',
      size: 14,
      color: '#8b5cf6' // purple - FIXED
    })

    links.push({
      source: company.id || company._key,
      target: authority.id || authority._key,
      type: 'employs',
      strength: 0.8,
      label: 'employs'
    })
  }

  // Level 1: Shared skills
  const jobSeekerSkills = jobSeeker.skills || []
  const authoritySkills = authority.skillsLookingFor || []
  const sharedSkillNames = jobSeekerSkills.filter(skill =>
    authoritySkills.some(authSkill =>
      authSkill.toLowerCase() === skill.toLowerCase()
    )
  )

  sharedSkillNames.forEach(skillName => {
    const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
    if (skill) {
      nodes.push({
        id: skill.id || skill._key,
        name: skill.name,
        type: 'skill',
        size: 12,
        color: '#10b981' // green - FIXED
      })

      links.push({
        source: jobSeeker.id || jobSeeker._key,
        target: skill.id || skill._key,
        type: 'has_skill',
        strength: 0.7,
        label: 'has skill'
      })

      links.push({
        source: authority.id || authority._key,
        target: skill.id || skill._key,
        type: 'seeks_skill',
        strength: 0.7,
        label: 'seeks'
      })
    }
  })

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      matchScore: match.score || 50,
      sharedSkills: sharedSkillNames.length,
      company: company?.name || 'Unknown'
    }
  }
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

  // Generate global network data with caching and optimization
  const globalNetworkData = useMemo(() => {
    if (loading || rawData.companies.length === 0) {
      return { nodes: [], links: [], stats: {} }
    }

    // Generate cache key based on data sizes
    const cacheKey = `global-network-${rawData.companies.length}-${rawData.hiringAuthorities.length}-${rawData.jobSeekers.length}-${rawData.skills.length}-${rawData.positions.length}-${rawData.matches.length}`

    // Check cache first
    const cachedData = visualizationCache.get(cacheKey)
    if (cachedData) {
      console.log('📦 Using cached global network data')
      return cachedData
    }

    console.log('🌐 Generating global network data...')
    performanceMonitor.start('global-network-generation')

    const networkData = generateNetworkData(
      rawData.companies,
      rawData.hiringAuthorities,
      rawData.jobSeekers,
      rawData.skills,
      rawData.positions,
      rawData.matches
    )

    // Optimize for performance if dataset is large
    const optimizedData = optimizeNetworkData(networkData, 500, 1000)

    // Cache the result
    visualizationCache.set(cacheKey, optimizedData)

    const metrics = performanceMonitor.end('global-network-generation')
    console.log('⚡ Global network generation metrics:', metrics)

    return optimizedData
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

      // Generate cache key for this specific visualization
      const cacheKey = `enhanced-viz-${rootNodeId}-${sortMethod}-${maxDistance}-${layoutType}-${JSON.stringify(filters)}`

      // Check cache first
      const cachedVisualization = visualizationCache.get(cacheKey)
      if (cachedVisualization) {
        console.log('📦 Using cached enhanced visualization for:', rootNodeId)
        return cachedVisualization
      }

      console.log('🎯 Generating enhanced visualization for root:', rootNodeId)
      performanceMonitor.start(`enhanced-viz-${rootNodeId}`)

      // Process with root node emphasis
      const processedData = processRootNodeVisualization(
        globalNetworkData,
        rootNodeId,
        { maxDistance, layoutType, filters, ...options }
      )

      // Apply sorting to nodes
      const sortedNodes = sortNetworkNodes(
        processedData.nodes,
        processedData.links,
        rootNodeId,
        sortMethod,
        { ...filters, maxResults: filters.maxResults }
      )

      const finalData = {
        ...processedData,
        nodes: sortedNodes,
        sortMethod,
        options
      }

      // Optimize if needed
      const optimizedData = optimizeNetworkData(finalData, 300, 600)

      // Cache the result
      visualizationCache.set(cacheKey, optimizedData)

      const metrics = performanceMonitor.end(`enhanced-viz-${rootNodeId}`)
      console.log('✅ Enhanced visualization generated:', {
        nodes: optimizedData.nodes.length,
        links: optimizedData.links.length,
        rootNode: rootNodeId,
        sortMethod,
        metrics
      })

      return optimizedData
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

// Export the provider
export { VisualizationDataProvider }
