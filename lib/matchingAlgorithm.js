// Hiring Authority Matching Algorithm
// Based on company size logic and skill alignment

export function calculateAuthorityMatch(jobSeeker, hiringAuthority, company) {
  let score = 0
  let matchReasons = []
  let hierarchyMatch = ''

  // 1. Company Size Logic (30% of score)
  const companySizeScore = calculateCompanySizeMatch(jobSeeker, hiringAuthority, company)
  score += companySizeScore.score * 0.3
  matchReasons.push(...companySizeScore.reasons)
  hierarchyMatch = companySizeScore.hierarchyMatch

  // 2. Skill Alignment (40% of score)
  const skillScore = calculateSkillAlignment(jobSeeker, hiringAuthority)
  score += skillScore.score * 0.4
  matchReasons.push(...skillScore.reasons)

  // 3. Experience Level Match (20% of score)
  const experienceScore = calculateExperienceMatch(jobSeeker, hiringAuthority)
  score += experienceScore.score * 0.2
  matchReasons.push(...experienceScore.reasons)

  // 4. Decision Making Power (10% of score)
  const decisionScore = calculateDecisionPower(hiringAuthority)
  score += decisionScore.score * 0.1
  matchReasons.push(...decisionScore.reasons)

  return {
    score: Math.round(score),
    matchReasons: matchReasons.slice(0, 4), // Top 4 reasons
    hierarchyMatch,
    connectionStrength: getConnectionStrength(score)
  }
}

function calculateCompanySizeMatch(jobSeeker, hiringAuthority, company) {
  const companySize = company.employeeCount
  const authorityLevel = hiringAuthority.level
  const jobSeekerExperience = jobSeeker.experience

  let score = 0
  let reasons = []
  let hierarchyMatch = ''

  // Startup Logic (<100 employees)
  if (companySize < 100) {
    if (authorityLevel === 'C-Suite') {
      score = 95
      reasons.push('Perfect startup match - direct access to decision maker')
      hierarchyMatch = 'Perfect - C-Suite authority for startup environment'
    } else {
      score = 60
      reasons.push('Startup prefers C-Suite hiring decisions')
      hierarchyMatch = 'Suboptimal - Startup should route to C-Suite'
    }
  }
  // Mid-size Logic (100-1000 employees)
  else if (companySize >= 100 && companySize <= 1000) {
    if (authorityLevel === 'Executive' || authorityLevel === 'Director') {
      score = 90
      reasons.push('Ideal mid-size company authority level')
      hierarchyMatch = 'Perfect - Executive/Director level for mid-size company'
    } else if (authorityLevel === 'C-Suite') {
      score = 75
      reasons.push('C-Suite accessible but may delegate to directors')
      hierarchyMatch = 'Good - C-Suite may delegate to department heads'
    } else {
      score = 65
      reasons.push('Manager level appropriate for specific roles')
      hierarchyMatch = 'Acceptable - Manager level for specialized positions'
    }
  }
  // Enterprise Logic (1000+ employees)
  else {
    if (authorityLevel === 'Director' || authorityLevel === 'Manager') {
      score = 85
      reasons.push('Appropriate enterprise hierarchy level')
      hierarchyMatch = 'Perfect - Director/Manager level for enterprise'
    } else if (authorityLevel === 'Executive') {
      score = 70
      reasons.push('Executive level may be too high for initial contact')
      hierarchyMatch = 'Good - Executive may route to appropriate director'
    } else {
      score = 50
      reasons.push('C-Suite rarely involved in individual hiring')
      hierarchyMatch = 'Poor - C-Suite too high for enterprise individual hiring'
    }
  }

  return { score, reasons, hierarchyMatch }
}

function calculateSkillAlignment(jobSeeker, hiringAuthority) {
  const jobSeekerSkills = jobSeeker.skills || []
  const authoritySkills = hiringAuthority.skillsLookingFor || []
  
  let matchingSkills = []
  let score = 0
  let reasons = []

  // Find matching skills
  for (const skill of jobSeekerSkills) {
    if (authoritySkills.includes(skill)) {
      matchingSkills.push(skill)
      // Weight by job seeker's skill level if available
      const skillLevel = jobSeeker.skillLevels?.[skill] || 5
      score += skillLevel * 10 // Max 100 points per skill
    }
  }

  // Calculate percentage match
  if (authoritySkills.length > 0) {
    const matchPercentage = (matchingSkills.length / authoritySkills.length) * 100
    score = Math.min(score / matchingSkills.length || 0, 100) * (matchPercentage / 100)
  }

  // Generate reasons
  if (matchingSkills.length > 0) {
    reasons.push(`${matchingSkills.length}/${authoritySkills.length} required skills match`)
    if (matchingSkills.length >= 3) {
      reasons.push('Strong technical skill alignment')
    }
  } else {
    reasons.push('Limited skill overlap - may need training')
  }

  return { score, reasons, matchingSkills }
}

function calculateExperienceMatch(jobSeeker, hiringAuthority) {
  const jobSeekerExp = jobSeeker.experience
  const preferredExp = hiringAuthority.preferredExperience || '3-8 years'
  
  // Parse preferred experience range
  const expRange = preferredExp.match(/(\d+)-(\d+)/)
  if (!expRange) return { score: 50, reasons: ['Experience requirements unclear'] }
  
  const minExp = parseInt(expRange[1])
  const maxExp = parseInt(expRange[2])
  
  let score = 0
  let reasons = []

  if (jobSeekerExp >= minExp && jobSeekerExp <= maxExp) {
    score = 90
    reasons.push(`Experience (${jobSeekerExp} years) perfectly matches requirements`)
  } else if (jobSeekerExp < minExp) {
    const gap = minExp - jobSeekerExp
    score = Math.max(40, 90 - (gap * 15))
    reasons.push(`${gap} years below preferred minimum experience`)
  } else {
    const excess = jobSeekerExp - maxExp
    score = Math.max(60, 90 - (excess * 10))
    reasons.push(`${excess} years above preferred maximum - may be overqualified`)
  }

  return { score, reasons }
}

function calculateDecisionPower(hiringAuthority) {
  const hiringPower = hiringAuthority.hiringPower
  const isDecisionMaker = hiringAuthority.decisionMaker
  
  let score = 0
  let reasons = []

  switch (hiringPower) {
    case 'Ultimate':
      score = 100
      reasons.push('Ultimate hiring authority - can make immediate decisions')
      break
    case 'High':
      score = 85
      reasons.push('High hiring authority - minimal approval needed')
      break
    case 'Medium':
      score = 70
      reasons.push('Medium hiring authority - may need additional approvals')
      break
    default:
      score = 50
      reasons.push('Limited hiring authority')
  }

  if (isDecisionMaker) {
    score = Math.min(100, score + 10)
    reasons.push('Direct decision maker')
  }

  return { score, reasons }
}

function getConnectionStrength(score) {
  if (score >= 85) return 'Strong'
  if (score >= 70) return 'Medium'
  if (score >= 55) return 'Weak'
  return 'Poor'
}

// Generate matches for all job seekers against all hiring authorities
export async function generateAllMatches(jobSeekers, hiringAuthorities, companies) {
  const matches = []
  
  for (const jobSeeker of jobSeekers) {
    for (const authority of hiringAuthorities) {
      // Find the authority's company
      const company = companies.find(c => `companies/${c._key}` === authority.companyId)
      if (!company) continue

      const match = calculateAuthorityMatch(jobSeeker, authority, company)
      
      // Only include matches above threshold
      if (match.score >= 50) {
        matches.push({
          _key: `match_${jobSeeker._key}_${authority._key}`,
          jobSeekerId: `jobSeekers/${jobSeeker._key}`,
          hiringAuthorityId: `hiringAuthorities/${authority._key}`,
          companyId: `companies/${company._key}`,
          score: match.score,
          matchReasons: match.matchReasons,
          hierarchyMatch: match.hierarchyMatch,
          connectionStrength: match.connectionStrength,
          status: match.score >= 80 ? 'recommended' : 'potential',
          createdAt: new Date().toISOString()
        })
      }
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score)
}

export default {
  calculateAuthorityMatch,
  generateAllMatches,
  getConnectionStrength
}
