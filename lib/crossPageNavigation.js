// Cross-page navigation utilities for interoperational functionality
// Ensures truthful data flow and quality linking between entities

/**
 * Generate navigation URLs for different entity types
 */
export const getEntityUrl = (entityType, entityId, context = null) => {
  const baseUrls = {
    company: '/companies',
    position: '/positions', 
    skill: '/skills',
    jobSeeker: '/job-seekers',
    authority: '/hiring-authorities',
    match: '/matches'
  }

  const baseUrl = baseUrls[entityType]
  if (!baseUrl) return '/'

  // Add context parameters for filtered views
  if (context) {
    const params = new URLSearchParams()
    if (context.company) params.set('company', context.company)
    if (context.skill) params.set('skill', context.skill)
    if (context.position) params.set('position', context.position)
    if (context.authority) params.set('authority', context.authority)
    
    return `${baseUrl}?${params.toString()}`
  }

  return baseUrl
}

/**
 * Generate visualization URLs with entity focus
 */
export const getVisualizationUrl = (entityType, entityId, viewType = 'network') => {
  const params = new URLSearchParams()
  params.set('focus', entityType)
  params.set('id', entityId)
  params.set('view', viewType)
  
  return `/visualizations?${params.toString()}`
}

/**
 * Generate matches URL with specific filtering
 */
export const getMatchesUrl = (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.company) params.set('company', filters.company)
  if (filters.position) params.set('position', filters.position)
  if (filters.skill) params.set('skill', filters.skill)
  if (filters.authority) params.set('authority', filters.authority)
  if (filters.jobSeeker) params.set('jobSeeker', filters.jobSeeker)
  
  return `/matches?${params.toString()}`
}

/**
 * Generate profile URL for any entity type
 */
export const getProfileUrl = (entityType, entityId) => {
  return `/${entityType}s/${entityId}/profile`
}

/**
 * Cross-reference entity relationships for truthful data display
 */
export const getRelatedEntities = (entity, entityType, allData) => {
  const related = {
    companies: [],
    positions: [],
    skills: [],
    authorities: [],
    jobSeekers: [],
    matches: []
  }

  if (!entity || !allData) return related

  switch (entityType) {
    case 'company':
      // Find positions at this company
      related.positions = allData.positions?.filter(p => 
        p.companyId === entity.id || p.company === entity.name
      ) || []
      
      // Find authorities at this company
      related.authorities = allData.hiringAuthorities?.filter(a => 
        a.companyId === entity.id || a.company === entity.name
      ) || []
      
      // Find skills required by company positions
      const companyPositions = related.positions
      related.skills = allData.skills?.filter(s => 
        companyPositions.some(p => p.requirements?.includes(s.name))
      ) || []
      
      // Find matches for company positions
      related.matches = allData.matches?.filter(m => 
        companyPositions.some(p => p.id === m.positionId)
      ) || []
      
      break

    case 'position':
      // Find the company for this position
      related.companies = allData.companies?.filter(c => 
        c.id === entity.companyId || c.name === entity.company
      ) || []
      
      // Find required skills
      related.skills = allData.skills?.filter(s => 
        entity.requirements?.includes(s.name)
      ) || []
      
      // Find hiring authorities for this position
      related.authorities = allData.hiringAuthorities?.filter(a => 
        a.companyId === entity.companyId || a.company === entity.company
      ) || []
      
      // Find matches for this position
      related.matches = allData.matches?.filter(m => 
        m.positionId === entity.id
      ) || []
      
      break

    case 'skill':
      // Find positions requiring this skill
      related.positions = allData.positions?.filter(p => 
        p.requirements?.includes(entity.name)
      ) || []
      
      // Find job seekers with this skill
      related.jobSeekers = allData.jobSeekers?.filter(js => 
        js.skills?.includes(entity.name)
      ) || []
      
      // Find companies with positions requiring this skill
      const skillPositions = related.positions
      related.companies = allData.companies?.filter(c => 
        skillPositions.some(p => p.companyId === c.id || p.company === c.name)
      ) || []
      
      break

    case 'authority':
      // Find the company for this authority
      related.companies = allData.companies?.filter(c => 
        c.id === entity.companyId || c.name === entity.company
      ) || []
      
      // Find positions at the same company
      related.positions = allData.positions?.filter(p => 
        p.companyId === entity.companyId || p.company === entity.company
      ) || []
      
      break

    case 'jobSeeker':
      // Find skills possessed by job seeker
      related.skills = allData.skills?.filter(s => 
        entity.skills?.includes(s.name)
      ) || []
      
      // Find matches for this job seeker
      related.matches = allData.matches?.filter(m => 
        m.jobSeekerId === entity.id
      ) || []
      
      // Find positions matching job seeker skills
      const jsSkills = entity.skills || []
      related.positions = allData.positions?.filter(p => 
        p.requirements?.some(req => jsSkills.includes(req))
      ) || []
      
      break
  }

  return related
}

/**
 * Validate entity data for truthfulness
 */
export const validateEntityData = (entity, entityType) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  }

  if (!entity) {
    validation.isValid = false
    validation.errors.push('Entity is null or undefined')
    return validation
  }

  // Common validations
  if (!entity.id && !entity._key) {
    validation.warnings.push('Entity missing unique identifier')
  }

  if (!entity.name) {
    validation.warnings.push('Entity missing name')
  }

  // Type-specific validations
  switch (entityType) {
    case 'company':
      if (!entity.industry) validation.warnings.push('Company missing industry')
      if (!entity.location) validation.warnings.push('Company missing location')
      break

    case 'position':
      if (!entity.title) validation.warnings.push('Position missing title')
      if (!entity.company && !entity.companyId) validation.warnings.push('Position missing company reference')
      break

    case 'skill':
      if (!entity.category) validation.warnings.push('Skill missing category')
      break

    case 'authority':
      if (!entity.role && !entity.level) validation.warnings.push('Authority missing role/level')
      if (!entity.company && !entity.companyId) validation.warnings.push('Authority missing company reference')
      break

    case 'jobSeeker':
      if (!entity.skills || entity.skills.length === 0) validation.warnings.push('Job seeker missing skills')
      break
  }

  return validation
}

/**
 * Generate breadcrumb navigation for entity pages
 */
export const generateBreadcrumbs = (entityType, entity, context = null) => {
  const breadcrumbs = [
    { label: 'Dashboard', url: '/' }
  ]

  // Add entity type page
  const entityTypeLabels = {
    company: 'Companies',
    position: 'Positions',
    skill: 'Skills',
    authority: 'Hiring Authorities',
    jobSeeker: 'Job Seekers',
    match: 'Matches'
  }

  breadcrumbs.push({
    label: entityTypeLabels[entityType] || 'Entities',
    url: getEntityUrl(entityType)
  })

  // Add current entity
  if (entity) {
    breadcrumbs.push({
      label: entity.name || entity.title || 'Current Entity',
      url: null // Current page
    })
  }

  return breadcrumbs
}
