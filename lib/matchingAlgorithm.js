// Enhanced Hiring Authority Matching Algorithm
// Based on company size logic, semantic skill alignment, and experience matching

// Skill normalization and semantic matching utilities
function normalizeSkills(skills) {
  return skills.map(skill => ({
    original: skill,
    normalized: skill.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  }))
}

// Semantic skill relationships for better matching
const skillRelationships = {
  // Frontend Technologies
  'react': ['frontend', 'javascript', 'jsx', 'ui', 'webdevelopment'],
  'vue': ['frontend', 'javascript', 'ui', 'webdevelopment'],
  'angular': ['frontend', 'javascript', 'typescript', 'ui', 'webdevelopment'],
  'javascript': ['frontend', 'webdevelopment', 'nodejs', 'react', 'vue'],
  'typescript': ['javascript', 'frontend', 'angular', 'nodejs'],

  // Backend Technologies
  'nodejs': ['backend', 'javascript', 'api', 'server'],
  'python': ['backend', 'machinelearning', 'ai', 'datascience', 'api'],
  'java': ['backend', 'enterprise', 'api', 'server'],
  'csharp': ['backend', 'dotnet', 'enterprise', 'api'],

  // Data & AI
  'machinelearning': ['ai', 'python', 'datascience', 'tensorflow', 'pytorch'],
  'datascience': ['python', 'machinelearning', 'ai', 'analytics'],
  'tensorflow': ['machinelearning', 'ai', 'python', 'deeplearning'],

  // Cloud & DevOps
  'aws': ['cloud', 'devops', 'infrastructure', 'docker', 'kubernetes'],
  'docker': ['devops', 'containerization', 'kubernetes', 'cloud'],
  'kubernetes': ['devops', 'containerization', 'docker', 'cloud'],

  // Methodologies
  'agile': ['scrum', 'projectmanagement', 'leadership'],
  'scrum': ['agile', 'projectmanagement', 'leadership'],
  'productmanagement': ['leadership', 'strategy', 'agile', 'userresearch']
}

function areSkillsRelated(skill1, skill2) {
  const relations1 = skillRelationships[skill1] || []
  const relations2 = skillRelationships[skill2] || []

  return relations1.includes(skill2) || relations2.includes(skill1)
}

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

// Enhanced skill matching with semantic understanding
function calculateSkillAlignment(jobSeeker, hiringAuthority) {
  const jobSeekerSkills = normalizeSkills(jobSeeker.skills || [])
  const authoritySkills = normalizeSkills(hiringAuthority.skillsLookingFor || [])

  let exactMatches = []
  let semanticMatches = []
  let score = 0
  let reasons = []

  // 1. Find exact matches (highest weight)
  for (const jsSkill of jobSeekerSkills) {
    for (const authSkill of authoritySkills) {
      if (jsSkill.normalized === authSkill.normalized) {
        exactMatches.push({ jobSeekerSkill: jsSkill.original, authoritySkill: authSkill.original })
        const skillLevel = jobSeeker.skillLevels?.[jsSkill.original] || 5
        score += skillLevel * 15 // Higher weight for exact matches
      }
    }
  }

  // 2. Find semantic matches (medium weight)
  for (const jsSkill of jobSeekerSkills) {
    for (const authSkill of authoritySkills) {
      if (jsSkill.normalized !== authSkill.normalized && areSkillsRelated(jsSkill.normalized, authSkill.normalized)) {
        semanticMatches.push({ jobSeekerSkill: jsSkill.original, authoritySkill: authSkill.original })
        const skillLevel = jobSeeker.skillLevels?.[jsSkill.original] || 5
        score += skillLevel * 8 // Lower weight for semantic matches
      }
    }
  }

  // Calculate match percentage and adjust score
  const totalMatches = exactMatches.length + semanticMatches.length
  if (authoritySkills.length > 0) {
    const matchPercentage = (totalMatches / authoritySkills.length) * 100
    score = Math.min(score / Math.max(totalMatches, 1), 100) * (matchPercentage / 100)
  }

  // Generate detailed reasons
  if (exactMatches.length > 0) {
    reasons.push(`${exactMatches.length} exact skill matches: ${exactMatches.map(m => m.jobSeekerSkill).join(', ')}`)
  }
  if (semanticMatches.length > 0) {
    reasons.push(`${semanticMatches.length} related skill matches: ${semanticMatches.map(m => m.jobSeekerSkill).join(', ')}`)
  }
  if (totalMatches === 0) {
    reasons.push('Limited skill overlap - may need training')
  } else if (totalMatches >= 3) {
    reasons.push('Strong technical skill alignment')
  }

  return {
    score,
    reasons,
    exactMatches,
    semanticMatches,
    totalMatches
  }
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
