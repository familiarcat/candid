// Format date to readable string
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Calculate match score between job seeker and position
export const calculateMatchScore = (jobSeeker, position) => {
  if (!jobSeeker || !position) return 0
  
  // In a real implementation, this would compare skills and requirements
  // For now, return a random score between 0-100
  return Math.floor(Math.random() * 101)
}

// Generate color based on match score
export const getMatchColor = (score) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800'
  if (score >= 60) return 'bg-green-100 text-green-800'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate entity icon based on type
export const getEntityIcon = (type) => {
  switch (type) {
    case 'jobSeeker': return '👤'
    case 'company': return '🏢'
    case 'hiringAuthority': return '👔'
    case 'position': return '📋'
    case 'skill': return '🔧'
    default: return '📄'
  }
}

// Generate relationship description
export const getRelationshipDescription = (type) => {
  switch (type) {
    case 'works_for': return 'Works for'
    case 'employs': return 'Employs'
    case 'posts': return 'Posted by'
    case 'requires': return 'Requires'
    case 'has_skill': return 'Has skill'
    case 'matched_to': return 'Matched to'
    default: return 'Related to'
  }
}