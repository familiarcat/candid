// Transform database data into visualization-friendly format

export function transformToNetworkData(companies, hiringAuthorities, jobSeekers, skills, matches) {
  const nodes = []
  const links = []

  // Add company nodes
  companies.forEach(company => {
    nodes.push({
      id: `company_${company._key}`,
      name: company.name,
      type: 'company',
      employeeCount: company.employeeCount,
      industry: company.industry,
      size: company.size,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    })
  })

  // Add hiring authority nodes
  hiringAuthorities.forEach(authority => {
    nodes.push({
      id: `authority_${authority._key}`,
      name: authority.name,
      type: 'authority',
      role: authority.role,
      level: authority.level,
      hiringPower: authority.hiringPower,
      decisionMaker: authority.decisionMaker,
      companyId: authority.companyId,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    })

    // Create company-authority links - ENHANCED with better debugging
    const companyKey = authority.companyId?.split('/')[1] || authority.company?.id || authority.company?._key
    if (companyKey) {
      const companyExists = nodes.find(n => n.id === `company_${companyKey}`)
      if (companyExists) {
        const linkStrength = authority.hiringPower === 'Ultimate' ? 3 : authority.hiringPower === 'High' ? 2 : 1

        links.push({
          source: `company_${companyKey}`,
          target: `authority_${authority._key}`,
          type: 'company',
          strength: linkStrength,
          value: linkStrength // For D3 compatibility
        })

        console.log(`🏢 Added company link: ${companyExists.name} → ${authority.name}`)
      } else {
        console.log(`❌ Company not found for authority: ${authority.name} (companyKey: ${companyKey})`)
      }
    } else {
      console.log(`❌ No company key for authority: ${authority.name}`)
    }
  })

  // Add job seeker nodes (limit to top matches for clarity)
  const topJobSeekers = jobSeekers.slice(0, 10) // Show top 10 for visualization clarity
  topJobSeekers.forEach(jobSeeker => {
    nodes.push({
      id: `jobSeeker_${jobSeeker._key}`,
      name: jobSeeker.name,
      type: 'jobSeeker',
      currentTitle: jobSeeker.currentTitle,
      experience: jobSeeker.experience,
      skills: jobSeeker.skills,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    })
  })

  // Add skill nodes (top skills only)
  const topSkills = skills.slice(0, 8) // Show top 8 skills
  topSkills.forEach(skill => {
    nodes.push({
      id: `skill_${skill._key}`,
      name: skill.name,
      type: 'skill',
      category: skill.category,
      demand: skill.demand,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150
    })
  })

  // Add match links - ENHANCED for better edge visibility
  const topMatches = matches
    .filter(match => match.score >= 60) // Lower threshold for more connections
    .slice(0, 30) // Increased limit for better network visualization

  console.log('🔗 Processing matches for visualization:', topMatches.length, 'matches')

  topMatches.forEach(match => {
    // Enhanced key extraction to handle different data structures
    const jobSeekerKey = match.jobSeekerId?.split('/')[1] || match.jobSeeker?.id || match.jobSeeker?._key
    const authorityKey = match.hiringAuthorityId?.split('/')[1] || match.hiringAuthority?.id || match.hiringAuthority?._key

    if (jobSeekerKey && authorityKey) {
      // Check if both nodes exist in our limited set
      const jobSeekerExists = nodes.find(n => n.id === `jobSeeker_${jobSeekerKey}`)
      const authorityExists = nodes.find(n => n.id === `authority_${authorityKey}`)

      if (jobSeekerExists && authorityExists) {
        const linkStrength = Math.max(1, (match.matchScore || match.score || 50) / 20) // Ensure minimum strength

        links.push({
          source: `jobSeeker_${jobSeekerKey}`,
          target: `authority_${authorityKey}`,
          type: 'hiring',
          strength: linkStrength,
          score: match.matchScore || match.score || 50,
          connectionStrength: match.connectionStrength || 'Medium',
          value: linkStrength // For D3 compatibility
        })

        console.log(`✅ Added hiring link: ${jobSeekerExists.name} → ${authorityExists.name} (score: ${match.score})`)
      } else {
        console.log(`❌ Missing nodes for match: jobSeeker_${jobSeekerKey} or authority_${authorityKey}`)
      }
    }
  })

  // Add skill connections for job seekers
  topJobSeekers.forEach(jobSeeker => {
    if (jobSeeker.skills) {
      jobSeeker.skills.slice(0, 3).forEach(skillKey => { // Limit to 3 skills per person
        const skillExists = nodes.find(n => n.id === `skill_${skillKey}`)
        if (skillExists) {
          links.push({
            source: `jobSeeker_${jobSeeker._key}`,
            target: `skill_${skillKey}`,
            type: 'skill',
            strength: (jobSeeker.skillLevels?.[skillKey] || 5) / 10
          })
        }
      })
    }
  })

  // Add skill requirements for authorities
  hiringAuthorities.forEach(authority => {
    if (authority.skillsLookingFor) {
      authority.skillsLookingFor.slice(0, 3).forEach(skillName => { // Limit to 3 skills per authority
        const skill = topSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
        if (skill) {
          links.push({
            source: `authority_${authority._key}`,
            target: `skill_${skill._key}`,
            type: 'skill',
            strength: 2
          })
        }
      })
    }
  })

  // Debug summary
  console.log('📊 Network Data Summary:')
  console.log(`  Nodes: ${nodes.length} (${nodes.filter(n => n.type === 'company').length} companies, ${nodes.filter(n => n.type === 'authority').length} authorities, ${nodes.filter(n => n.type === 'jobSeeker').length} job seekers, ${nodes.filter(n => n.type === 'skill').length} skills)`)
  console.log(`  Links: ${links.length} (${links.filter(l => l.type === 'hiring').length} hiring, ${links.filter(l => l.type === 'company').length} company, ${links.filter(l => l.type === 'skill').length} skill)`)

  return { nodes, links }
}

export function transformToHierarchyData(companies, hiringAuthorities) {
  return companies.map(company => {
    const companyAuthorities = hiringAuthorities.filter(auth =>
      auth.companyId === `companies/${company._key}`
    )

    // Group authorities by level
    const hierarchy = {
      name: company.name,
      type: 'company',
      size: company.employeeCount,
      industry: company.industry,
      children: []
    }

    const levels = ['C-Suite', 'Executive', 'Director', 'Manager']

    levels.forEach(level => {
      const authoritiesAtLevel = companyAuthorities.filter(auth => auth.level === level)
      if (authoritiesAtLevel.length > 0) {
        hierarchy.children.push({
          name: level,
          type: 'level',
          children: authoritiesAtLevel.map(auth => ({
            name: auth.name,
            role: auth.role,
            type: 'authority',
            hiringPower: auth.hiringPower,
            decisionMaker: auth.decisionMaker,
            skillsLookingFor: auth.skillsLookingFor || []
          }))
        })
      }
    })

    return hierarchy
  })
}

export function transformToMatchHeatmap(matches, jobSeekers, hiringAuthorities) {
  const heatmapData = []

  // Create a matrix of job seekers vs hiring authorities
  jobSeekers.slice(0, 10).forEach((jobSeeker, jsIndex) => {
    hiringAuthorities.forEach((authority, authIndex) => {
      const match = matches.find(m =>
        m.jobSeekerId === `jobSeekers/${jobSeeker._key}` &&
        m.hiringAuthorityId === `hiringAuthorities/${authority._key}`
      )

      heatmapData.push({
        jobSeeker: jobSeeker.name,
        jobSeekerIndex: jsIndex,
        authority: authority.name,
        authorityIndex: authIndex,
        score: match ? match.score : 0,
        connectionStrength: match ? match.connectionStrength : 'None',
        company: authority.companyId?.split('/')[1] || 'Unknown'
      })
    })
  })

  return heatmapData
}

export function transformToSkillDemandData(skills, jobSeekers, hiringAuthorities) {
  const skillDemand = {}

  // Count skill occurrences in job seekers
  jobSeekers.forEach(jobSeeker => {
    if (jobSeeker.skills) {
      jobSeeker.skills.forEach(skillKey => {
        const skill = skills.find(s => s._key === skillKey)
        if (skill) {
          if (!skillDemand[skill.name]) {
            skillDemand[skill.name] = {
              name: skill.name,
              category: skill.category,
              jobSeekerCount: 0,
              authorityDemand: 0,
              marketDemand: skill.demand
            }
          }
          skillDemand[skill.name].jobSeekerCount++
        }
      })
    }
  })

  // Count skill requirements in hiring authorities
  hiringAuthorities.forEach(authority => {
    if (authority.skillsLookingFor) {
      authority.skillsLookingFor.forEach(skillName => {
        if (!skillDemand[skillName]) {
          skillDemand[skillName] = {
            name: skillName,
            category: 'Unknown',
            jobSeekerCount: 0,
            authorityDemand: 0,
            marketDemand: 'Medium'
          }
        }
        skillDemand[skillName].authorityDemand++
      })
    }
  })

  return Object.values(skillDemand).sort((a, b) =>
    (b.jobSeekerCount + b.authorityDemand) - (a.jobSeekerCount + a.authorityDemand)
  )
}

export function transformToCompanySizeFlow(companies, hiringAuthorities, matches) {
  const flowData = {
    nodes: [],
    links: []
  }

  // Company size categories
  const sizeCategories = [
    { name: 'Startup (<100)', min: 0, max: 99, color: '#10b981' },
    { name: 'Mid-size (100-1000)', min: 100, max: 999, color: '#3b82f6' },
    { name: 'Enterprise (1000+)', min: 1000, max: Infinity, color: '#8b5cf6' }
  ]

  // Authority levels
  const authorityLevels = ['C-Suite', 'Executive', 'Director', 'Manager']

  // Create nodes for size categories and authority levels
  sizeCategories.forEach(category => {
    flowData.nodes.push({
      id: category.name,
      type: 'companySize',
      color: category.color
    })
  })

  authorityLevels.forEach(level => {
    flowData.nodes.push({
      id: level,
      type: 'authorityLevel',
      color: '#6b7280'
    })
  })

  // Create links based on company size logic
  companies.forEach(company => {
    const category = sizeCategories.find(cat =>
      company.employeeCount >= cat.min && company.employeeCount <= cat.max
    )

    if (category) {
      const companyAuthorities = hiringAuthorities.filter(auth =>
        auth.companyId === `companies/${company._key}`
      )

      companyAuthorities.forEach(authority => {
        const existingLink = flowData.links.find(link =>
          link.source === category.name && link.target === authority.level
        )

        if (existingLink) {
          existingLink.value++
        } else {
          flowData.links.push({
            source: category.name,
            target: authority.level,
            value: 1
          })
        }
      })
    }
  })

  return flowData
}
