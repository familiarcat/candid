// Process raw data from ArangoDB into format for D3.js and 3D-Force-Graph
export const processGraphData = (data) => {
  if (!data) return { nodes: [], links: [] }
  
  const { entities, relationships } = data
  
  // Process nodes
  const nodes = entities.map(entity => ({
    id: entity._id,
    name: entity.name || entity.title || 'Unnamed',
    type: getEntityType(entity._id),
    size: getNodeSize(entity),
    ...entity // Include all original properties
  }))
  
  // Process links
  const links = relationships.map(rel => ({
    source: rel._from,
    target: rel._to,
    value: rel.strength || 1,
    type: rel._type || getEdgeType(rel._id),
    ...rel // Include all original properties
  }))
  
  return { nodes, links }
}

// Determine entity type from _id
const getEntityType = (id) => {
  if (!id) return 'unknown'
  
  if (id.includes('/jobSeekers/')) return 'jobSeeker'
  if (id.includes('/companies/')) return 'company'
  if (id.includes('/hiringAuthorities/')) return 'hiringAuthority'
  if (id.includes('/positions/')) return 'position'
  if (id.includes('/skills/')) return 'skill'
  
  return 'unknown'
}

// Determine edge type from _id
const getEdgeType = (id) => {
  if (!id) return 'unknown'
  
  if (id.includes('/works_for/')) return 'works_for'
  if (id.includes('/employs/')) return 'employs'
  if (id.includes('/posts/')) return 'posts'
  if (id.includes('/requires/')) return 'requires'
  if (id.includes('/has_skill/')) return 'has_skill'
  if (id.includes('/matched_to/')) return 'matched_to'
  
  return 'unknown'
}

// Determine node size based on entity type and properties
const getNodeSize = (entity) => {
  const type = getEntityType(entity._id)
  
  switch (type) {
    case 'jobSeeker':
      return 8
    case 'company':
      return 10
    case 'hiringAuthority':
      return 7
    case 'position':
      return 9
    case 'skill':
      // Skills with higher demand are larger
      return entity.demandScore ? 5 + (entity.demandScore / 20) : 6
    default:
      return 5
  }
}

// Generate sample graph data for testing
export const generateSampleGraphData = () => {
  // Create sample nodes
  const jobSeekers = Array.from({ length: 5 }, (_, i) => ({
    id: `jobSeekers/${i}`,
    name: `Job Seeker ${i+1}`,
    type: 'jobSeeker',
    size: 8
  }))
  
  const companies = Array.from({ length: 3 }, (_, i) => ({
    id: `companies/${i}`,
    name: `Company ${i+1}`,
    type: 'company',
    size: 10
  }))
  
  const positions = Array.from({ length: 4 }, (_, i) => ({
    id: `positions/${i}`,
    name: `Position ${i+1}`,
    type: 'position',
    size: 9
  }))
  
  const skills = Array.from({ length: 8 }, (_, i) => ({
    id: `skills/${i}`,
    name: `Skill ${i+1}`,
    type: 'skill',
    size: 6
  }))
  
  const nodes = [...jobSeekers, ...companies, ...positions, ...skills]
  
  // Create sample links
  const links = []
  
  // Job seekers to companies
  jobSeekers.forEach((js, i) => {
    links.push({
      source: js.id,
      target: companies[i % companies.length].id,
      type: 'works_for',
      value: 1
    })
  })
  
  // Companies to positions
  companies.forEach((company, i) => {
    positions.forEach((position, j) => {
      if ((i + j) % 2 === 0) {
        links.push({
          source: company.id,
          target: position.id,
          type: 'posts',
          value: 1
        })
      }
    })
  })
  
  // Job seekers to skills
  jobSeekers.forEach((js) => {
    // Each job seeker has 2-4 random skills
    const numSkills = 2 + Math.floor(Math.random() * 3)
    const shuffled = [...skills].sort(() => 0.5 - Math.random())
    const selectedSkills = shuffled.slice(0, numSkills)
    
    selectedSkills.forEach((skill) => {
      links.push({
        source: js.id,
        target: skill.id,
        type: 'has_skill',
        value: 1
      })
    })
  })
  
  // Positions to skills
  positions.forEach((position) => {
    // Each position requires 2-3 random skills
    const numSkills = 2 + Math.floor(Math.random() * 2)
    const shuffled = [...skills].sort(() => 0.5 - Math.random())
    const selectedSkills = shuffled.slice(0, numSkills)
    
    selectedSkills.forEach((skill) => {
      links.push({
        source: position.id,
        target: skill.id,
        type: 'requires',
        value: 1
      })
    })
  })
  
  return { nodes, links }
}