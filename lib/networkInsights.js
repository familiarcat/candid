// Network Insights Calculator - Real data-driven insights for visualization
// Calculates High Match Potential, Growing Connections, and Skill Gaps

/**
 * Calculate comprehensive network insights from real data
 * @param {Object} rawData - Raw data from VisualizationDataProvider
 * @param {Object} networkData - Processed network data
 * @returns {Object} Network insights with visual data
 */
export function calculateNetworkInsights(rawData, networkData) {
  if (!rawData || !networkData) {
    return {
      highMatchPotential: { value: 0, trend: 'stable', details: [] },
      growingConnections: { value: 0, trend: 'stable', details: [] },
      skillGaps: { value: 0, trend: 'stable', details: [] }
    }
  }

  const { companies, hiringAuthorities, jobSeekers, skills, positions, matches } = rawData

  // Calculate High Match Potential
  const highMatchPotential = calculateHighMatchPotential(matches, hiringAuthorities, jobSeekers)
  
  // Calculate Growing Connections
  const growingConnections = calculateGrowingConnections(networkData, matches)
  
  // Calculate Skill Gaps
  const skillGaps = calculateSkillGaps(skills, jobSeekers, hiringAuthorities, positions)

  return {
    highMatchPotential,
    growingConnections,
    skillGaps
  }
}

/**
 * Calculate high match potential based on match scores and skill alignment
 */
function calculateHighMatchPotential(matches, hiringAuthorities, jobSeekers) {
  if (!matches || matches.length === 0) {
    return {
      value: 0,
      percentage: 0,
      trend: 'stable',
      details: ['No matches available for analysis'],
      topMatches: []
    }
  }

  // Calculate match quality distribution
  const highQualityMatches = matches.filter(m => (m.score || m.matchScore || 0) >= 80)
  const mediumQualityMatches = matches.filter(m => {
    const score = m.score || m.matchScore || 0
    return score >= 60 && score < 80
  })
  
  const totalMatches = matches.length
  const highQualityPercentage = (highQualityMatches.length / totalMatches) * 100
  
  // Calculate average match score
  const avgMatchScore = matches.reduce((sum, m) => sum + (m.score || m.matchScore || 0), 0) / totalMatches

  // Identify top potential matches
  const topMatches = matches
    .sort((a, b) => (b.score || b.matchScore || 0) - (a.score || a.matchScore || 0))
    .slice(0, 5)
    .map(match => ({
      jobSeekerName: match.jobSeeker?.name || 'Unknown',
      authorityName: match.hiringAuthority?.name || 'Unknown',
      company: match.hiringAuthority?.company || 'Unknown',
      score: match.score || match.matchScore || 0,
      skills: match.matchReasons?.filter(r => r.includes('skill')) || []
    }))

  // Determine trend based on score distribution
  let trend = 'stable'
  if (highQualityPercentage > 40) trend = 'growing'
  else if (highQualityPercentage < 20) trend = 'declining'

  return {
    value: highQualityMatches.length,
    percentage: Math.round(highQualityPercentage),
    avgScore: Math.round(avgMatchScore),
    trend,
    details: [
      `${highQualityMatches.length} high-quality matches (80%+ score)`,
      `${mediumQualityMatches.length} medium-quality matches (60-79% score)`,
      `Average match score: ${Math.round(avgMatchScore)}%`,
      `${Math.round(highQualityPercentage)}% of matches are high quality`
    ],
    topMatches
  }
}

/**
 * Calculate growing connections based on network density and recent activity
 */
function calculateGrowingConnections(networkData, matches) {
  if (!networkData || !networkData.nodes || !networkData.links) {
    return {
      value: 0,
      density: 0,
      trend: 'stable',
      details: ['No network data available'],
      recentConnections: []
    }
  }

  const { nodes, links } = networkData
  
  // Calculate network density
  const maxPossibleLinks = (nodes.length * (nodes.length - 1)) / 2
  const currentDensity = maxPossibleLinks > 0 ? (links.length / maxPossibleLinks) * 100 : 0
  
  // Calculate connections by type
  const connectionsByType = links.reduce((acc, link) => {
    acc[link.type] = (acc[link.type] || 0) + 1
    return acc
  }, {})

  // Calculate average connections per node
  const avgConnectionsPerNode = nodes.length > 0 ? (links.length * 2) / nodes.length : 0

  // Analyze recent matches (if timestamps available)
  const recentMatches = matches
    .filter(m => m.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)

  // Determine trend based on density and recent activity
  let trend = 'stable'
  if (currentDensity > 15) trend = 'growing'
  else if (currentDensity < 5) trend = 'declining'

  return {
    value: links.length,
    density: Math.round(currentDensity * 100) / 100,
    avgConnectionsPerNode: Math.round(avgConnectionsPerNode * 10) / 10,
    trend,
    details: [
      `${links.length} total connections in network`,
      `${Math.round(currentDensity * 100) / 100}% network density`,
      `${Math.round(avgConnectionsPerNode * 10) / 10} avg connections per node`,
      `${Object.keys(connectionsByType).length} different connection types`
    ],
    connectionsByType,
    recentConnections: recentMatches.slice(0, 5).map(m => ({
      type: 'match',
      source: m.jobSeeker?.name || 'Unknown',
      target: m.hiringAuthority?.name || 'Unknown',
      score: m.score || m.matchScore || 0,
      date: m.createdAt
    }))
  }
}

/**
 * Calculate skill gaps based on supply vs demand analysis
 */
function calculateSkillGaps(skills, jobSeekers, hiringAuthorities, positions) {
  if (!skills || skills.length === 0) {
    return {
      value: 0,
      trend: 'stable',
      details: ['No skills data available'],
      topGaps: [],
      oversupplied: []
    }
  }

  const skillAnalysis = skills.map(skill => {
    // Count job seekers with this skill
    const supply = jobSeekers.filter(js => 
      js.skills && js.skills.some(s => 
        s.toLowerCase().includes(skill.name.toLowerCase()) ||
        skill.name.toLowerCase().includes(s.toLowerCase())
      )
    ).length

    // Count hiring authorities looking for this skill
    const demand = hiringAuthorities.filter(auth => 
      auth.skillsLookingFor && auth.skillsLookingFor.some(s => 
        s.toLowerCase().includes(skill.name.toLowerCase()) ||
        skill.name.toLowerCase().includes(s.toLowerCase())
      )
    ).length

    // Count positions requiring this skill
    const positionDemand = positions ? positions.filter(pos => 
      pos.requiredSkills && pos.requiredSkills.some(s => 
        s.toLowerCase().includes(skill.name.toLowerCase()) ||
        skill.name.toLowerCase().includes(s.toLowerCase())
      )
    ).length : 0

    const totalDemand = demand + positionDemand
    const gap = totalDemand - supply
    const ratio = supply > 0 ? totalDemand / supply : totalDemand

    return {
      name: skill.name,
      category: skill.category || 'General',
      supply,
      demand: totalDemand,
      gap,
      ratio,
      severity: gap > 5 ? 'high' : gap > 2 ? 'medium' : gap > 0 ? 'low' : 'none'
    }
  })

  // Identify top skill gaps (high demand, low supply)
  const topGaps = skillAnalysis
    .filter(s => s.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)

  // Identify oversupplied skills (high supply, low demand)
  const oversupplied = skillAnalysis
    .filter(s => s.gap < -2)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 5)

  // Calculate overall gap metrics
  const totalGaps = topGaps.length
  const criticalGaps = topGaps.filter(s => s.severity === 'high').length
  const avgGapSize = topGaps.length > 0 ? 
    topGaps.reduce((sum, s) => sum + s.gap, 0) / topGaps.length : 0

  // Determine trend
  let trend = 'stable'
  if (criticalGaps > 3) trend = 'growing'
  else if (totalGaps < 3) trend = 'improving'

  return {
    value: totalGaps,
    criticalGaps,
    avgGapSize: Math.round(avgGapSize * 10) / 10,
    trend,
    details: [
      `${totalGaps} skills with supply/demand gaps`,
      `${criticalGaps} critical skill shortages identified`,
      `${oversupplied.length} oversupplied skills found`,
      `Average gap size: ${Math.round(avgGapSize * 10) / 10} positions`
    ],
    topGaps: topGaps.map(s => ({
      name: s.name,
      category: s.category,
      gap: s.gap,
      supply: s.supply,
      demand: s.demand,
      severity: s.severity
    })),
    oversupplied: oversupplied.map(s => ({
      name: s.name,
      category: s.category,
      surplus: Math.abs(s.gap),
      supply: s.supply,
      demand: s.demand
    }))
  }
}

/**
 * Get trend icon and color for display
 */
export function getTrendDisplay(trend) {
  const trendMap = {
    growing: { icon: '📈', color: 'text-green-600', bg: 'bg-green-50' },
    declining: { icon: '📉', color: 'text-red-600', bg: 'bg-red-50' },
    improving: { icon: '✅', color: 'text-blue-600', bg: 'bg-blue-50' },
    stable: { icon: '➡️', color: 'text-gray-600', bg: 'bg-gray-50' }
  }
  return trendMap[trend] || trendMap.stable
}

export default {
  calculateNetworkInsights,
  getTrendDisplay
}
