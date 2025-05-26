// Enhanced graph data generator for network visualizations
// Generates proper nodes and edges for D3.js and Three.js visualizations

export function generateNetworkData(companies, authorities, jobSeekers, skills, positions, matches) {
  const nodes = []
  const links = []

  // Add company nodes
  companies.forEach(company => {
    nodes.push({
      id: `company_${company._key || company.id}`,
      name: company.name,
      type: 'company',
      employeeCount: company.employeeCount,
      industry: company.industry,
      size: company.size,
      location: company.location,
      data: company
    })
  })

  // Add hiring authority nodes
  authorities.forEach(authority => {
    nodes.push({
      id: `authority_${authority._key || authority.id}`,
      name: authority.name,
      type: 'authority',
      level: authority.level,
      hiringPower: authority.hiringPower,
      role: authority.role,
      companyId: authority.companyId,
      data: authority
    })

    // Link authority to company
    const companyKey = authority.companyId?.replace('companies/', '') || authority.companyId
    if (companyKey) {
      links.push({
        source: `authority_${authority._key || authority.id}`,
        target: `company_${companyKey}`,
        type: 'employment',
        strength: authority.hiringPower === 'Ultimate' ? 3 : authority.hiringPower === 'High' ? 2 : 1,
        label: 'works for'
      })
    }
  })

  // Add job seeker nodes
  jobSeekers.forEach(jobSeeker => {
    nodes.push({
      id: `jobSeeker_${jobSeeker._key || jobSeeker.id}`,
      name: jobSeeker.name,
      type: 'jobSeeker',
      experience: jobSeeker.experience,
      title: jobSeeker.currentTitle || jobSeeker.title,
      location: jobSeeker.location,
      skills: jobSeeker.skills,
      data: jobSeeker
    })
  })

  // Add skill nodes
  skills.forEach(skill => {
    nodes.push({
      id: `skill_${skill._key || skill.id}`,
      name: skill.name,
      type: 'skill',
      category: skill.category,
      demand: skill.demand,
      data: skill
    })
  })

  // Add position nodes if provided
  if (positions) {
    positions.forEach(position => {
      nodes.push({
        id: `position_${position._key || position.id}`,
        name: position.title,
        type: 'position',
        level: position.level,
        company: position.companyId,
        authority: position.authorityId,
        requirements: position.requirements,
        data: position
      })

      // Link position to company
      const companyKey = position.companyId?.replace('companies/', '') || position.companyId
      if (companyKey) {
        links.push({
          source: `position_${position._key || position.id}`,
          target: `company_${companyKey}`,
          type: 'company',
          strength: 2,
          label: 'posted by'
        })
      }

      // Link position to hiring authority
      const authorityKey = position.authorityId?.replace('hiringAuthorities/', '') || position.authorityId
      if (authorityKey) {
        links.push({
          source: `authority_${authorityKey}`,
          target: `position_${position._key || position.id}`,
          type: 'hiring',
          strength: 2,
          label: 'manages'
        })
      }

      // Link position to required skills
      if (position.requirements) {
        position.requirements.forEach(skillName => {
          const skill = skills.find(s => s.name === skillName)
          if (skill) {
            links.push({
              source: `position_${position._key || position.id}`,
              target: `skill_${skill._key || skill.id}`,
              type: 'skill',
              strength: 1,
              label: 'requires'
            })
          }
        })
      }
    })
  }

  // Add job seeker skill connections
  jobSeekers.forEach(jobSeeker => {
    if (jobSeeker.skills) {
      jobSeeker.skills.forEach(skillName => {
        const skill = skills.find(s => s.name === skillName)
        if (skill) {
          const skillLevel = jobSeeker.skillLevels?.[skillName] || 5
          links.push({
            source: `jobSeeker_${jobSeeker._key || jobSeeker.id}`,
            target: `skill_${skill._key || skill.id}`,
            type: 'skill',
            strength: skillLevel / 10, // Normalize to 0-1
            label: `has skill (${skillLevel}/10)`
          })
        }
      })
    }
  })

  // Add authority skill preferences
  authorities.forEach(authority => {
    if (authority.skillsLookingFor) {
      authority.skillsLookingFor.forEach(skillName => {
        const skill = skills.find(s => s.name === skillName)
        if (skill) {
          links.push({
            source: `authority_${authority._key || authority.id}`,
            target: `skill_${skill._key || skill.id}`,
            type: 'preference',
            strength: authority.hiringPower === 'Ultimate' ? 1 : 0.7,
            label: 'seeks'
          })
        }
      })
    }
  })

  // Add match connections if provided
  if (matches) {
    matches.forEach(match => {
      const jobSeekerKey = match.jobSeekerId?.replace('jobSeekers/', '') || match.jobSeekerId
      const authorityKey = match.hiringAuthorityId?.replace('hiringAuthorities/', '') || match.authorityId?.replace('hiringAuthorities/', '') || match.authorityId

      if (jobSeekerKey && authorityKey) {
        links.push({
          source: `jobSeeker_${jobSeekerKey}`,
          target: `authority_${authorityKey}`,
          type: 'match',
          strength: (match.score || match.matchScore || 50) / 100, // Normalize score
          label: `match (${Math.round(match.score || match.matchScore || 50)}%)`,
          status: match.status
        })
      }
    })
  }

  // Generate synthetic connections if data is too sparse
  const minConnectionsPerNode = 2
  const currentConnectionsPerNode = nodes.length > 0 ? links.length / nodes.length : 0

  console.log('📊 Network density analysis:', {
    nodes: nodes.length,
    links: links.length,
    connectionsPerNode: currentConnectionsPerNode.toFixed(2),
    minRequired: minConnectionsPerNode
  })

  if (currentConnectionsPerNode < minConnectionsPerNode && nodes.length > 1) {
    console.log('🔗 Generating synthetic connections to improve visualization...')

    // Create additional skill-based connections
    const jobSeekerNodes = nodes.filter(n => n.type === 'jobSeeker')
    const authorityNodes = nodes.filter(n => n.type === 'authority')
    const skillNodes = nodes.filter(n => n.type === 'skill')

    // Connect job seekers to random skills if they don't have enough connections
    jobSeekerNodes.forEach(jobSeeker => {
      const existingSkillConnections = links.filter(l =>
        l.source === jobSeeker.id && l.type === 'skill'
      ).length

      if (existingSkillConnections < 3 && skillNodes.length > 0) {
        const randomSkills = skillNodes
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 - existingSkillConnections)

        randomSkills.forEach(skill => {
          links.push({
            source: jobSeeker.id,
            target: skill.id,
            type: 'skill',
            strength: 0.5 + Math.random() * 0.5,
            label: 'has skill',
            synthetic: true
          })
        })
      }
    })

    // Connect authorities to skills they might be looking for
    authorityNodes.forEach(authority => {
      const existingSkillConnections = links.filter(l =>
        l.source === authority.id && l.type === 'preference'
      ).length

      if (existingSkillConnections < 2 && skillNodes.length > 0) {
        const randomSkills = skillNodes
          .sort(() => Math.random() - 0.5)
          .slice(0, 2 - existingSkillConnections)

        randomSkills.forEach(skill => {
          links.push({
            source: authority.id,
            target: skill.id,
            type: 'preference',
            strength: 0.6 + Math.random() * 0.4,
            label: 'seeks',
            synthetic: true
          })
        })
      }
    })

    console.log(`✅ Added ${links.filter(l => l.synthetic).length} synthetic connections`)
  }

  return {
    nodes,
    links,
    stats: {
      totalNodes: nodes.length,
      totalLinks: links.length,
      syntheticLinks: links.filter(l => l.synthetic).length,
      connectionsPerNode: nodes.length > 0 ? (links.length / nodes.length).toFixed(2) : 0,
      nodeTypes: {
        companies: nodes.filter(n => n.type === 'company').length,
        authorities: nodes.filter(n => n.type === 'authority').length,
        jobSeekers: nodes.filter(n => n.type === 'jobSeeker').length,
        skills: nodes.filter(n => n.type === 'skill').length,
        positions: nodes.filter(n => n.type === 'position').length
      },
      linkTypes: {
        employment: links.filter(l => l.type === 'employment').length,
        hiring: links.filter(l => l.type === 'hiring').length,
        skill: links.filter(l => l.type === 'skill').length,
        company: links.filter(l => l.type === 'company').length,
        preference: links.filter(l => l.type === 'preference').length,
        match: links.filter(l => l.type === 'match').length
      }
    }
  }
}

// Generate focused network data for a specific entity
export function generateFocusedNetworkData(focusEntity, allData, maxDepth = 2) {
  const { companies, authorities, jobSeekers, skills, positions, matches } = allData
  const fullNetwork = generateNetworkData(companies, authorities, jobSeekers, skills, positions, matches)

  const focusId = `${focusEntity.type}_${focusEntity._key || focusEntity.id}`
  const includedNodes = new Set([focusId])
  const includedLinks = []

  // Find all nodes within maxDepth of the focus node
  for (let depth = 0; depth < maxDepth; depth++) {
    const currentNodes = Array.from(includedNodes)

    fullNetwork.links.forEach(link => {
      if (currentNodes.includes(link.source) || currentNodes.includes(link.target)) {
        includedNodes.add(link.source)
        includedNodes.add(link.target)

        // Only add the link if we haven't already included it
        if (!includedLinks.find(l =>
          (l.source === link.source && l.target === link.target) ||
          (l.source === link.target && l.target === link.source)
        )) {
          includedLinks.push(link)
        }
      }
    })
  }

  const focusedNodes = fullNetwork.nodes.filter(node => includedNodes.has(node.id))

  // Mark the focus node
  focusedNodes.forEach(node => {
    if (node.id === focusId) {
      node.isFocus = true
    }
  })

  return {
    nodes: focusedNodes,
    links: includedLinks,
    focusNode: focusedNodes.find(n => n.id === focusId),
    stats: {
      totalNodes: focusedNodes.length,
      totalLinks: includedLinks.length,
      depth: maxDepth
    }
  }
}

// Generate hierarchical data for company organization charts
export function generateCompanyHierarchy(company, authorities, positions) {
  const hierarchy = {
    id: `company_${company._key || company.id}`,
    name: company.name,
    type: 'company',
    data: company,
    children: []
  }

  // Group authorities by level
  const authorityLevels = {
    'C-Suite': [],
    'Executive': [],
    'Director': [],
    'Manager': []
  }

  authorities.forEach(authority => {
    const level = authority.level || 'Manager'
    if (authorityLevels[level]) {
      authorityLevels[level].push({
        id: `authority_${authority._key || authority.id}`,
        name: authority.name,
        type: 'authority',
        level: authority.level,
        role: authority.role,
        hiringPower: authority.hiringPower,
        data: authority,
        children: []
      })
    }
  })

  // Add positions to authorities
  positions.forEach(position => {
    const authorityKey = position.authorityId?.replace('hiringAuthorities/', '') || position.authorityId
    Object.values(authorityLevels).flat().forEach(authority => {
      if (authority.id === `authority_${authorityKey}`) {
        authority.children.push({
          id: `position_${position._key || position.id}`,
          name: position.title,
          type: 'position',
          level: position.level,
          data: position
        })
      }
    })
  })

  // Build hierarchy: C-Suite -> Executive -> Director -> Manager
  const levels = ['C-Suite', 'Executive', 'Director', 'Manager']
  let currentLevel = hierarchy

  levels.forEach(level => {
    if (authorityLevels[level].length > 0) {
      currentLevel.children.push(...authorityLevels[level])
    }
  })

  return hierarchy
}
