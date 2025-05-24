import { initDb } from '../../lib/db'

export default async function handler(req, res) {
  const { method } = req

  try {
    const { db, collections } = await initDb()

    switch (method) {
      case 'GET':
        await handleGet(req, res, db, collections)
        break
      case 'POST':
        await handlePost(req, res, db, collections)
        break
      case 'PUT':
        await handlePut(req, res, db, collections)
        break
      case 'DELETE':
        await handleDelete(req, res, db, collections)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function handleGet(req, res, db, collections) {
  const { id, category, limit = 50, offset = 0, includeStats = false } = req.query

  try {
    if (id) {
      // Get single skill with detailed stats
      const query = `
        LET skill = DOCUMENT('skills', @id)
        LET jobSeekers = (
          FOR edge IN has_skill
            FILTER edge._to == skill._id
            RETURN DOCUMENT(edge._from)
        )
        LET positions = (
          FOR edge IN requires
            FILTER edge._to == skill._id
            RETURN DOCUMENT(edge._from)
        )
        LET relatedSkills = (
          FOR js IN jobSeekers
            FOR edge IN has_skill
              FILTER edge._from == js._id AND edge._to != skill._id
              LET relatedSkill = DOCUMENT(edge._to)
              COLLECT skillName = relatedSkill.name WITH COUNT INTO frequency
              SORT frequency DESC
              LIMIT 10
              RETURN skillName
        )
        RETURN {
          id: skill._key,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          icon: skill.icon,
          jobSeekers: LENGTH(jobSeekers),
          openPositions: LENGTH(positions[* FILTER CURRENT.status == 'active']),
          totalPositions: LENGTH(positions),
          demand: LENGTH(positions[* FILTER CURRENT.status == 'active']) > 0 ? 
            MIN([100, (LENGTH(positions[* FILTER CURRENT.status == 'active']) / LENGTH(jobSeekers)) * 100]) : 0,
          supply: LENGTH(jobSeekers),
          relatedSkills: relatedSkills,
          averageSalary: AVG(positions[* FILTER CURRENT.salary != null].salary),
          growth: skill.growth || 0
        }
      `

      const cursor = await db.query(query, { id })
      const result = await cursor.all()

      if (result.length === 0) {
        return res.status(404).json({ error: 'Skill not found' })
      }

      res.status(200).json(result[0])
    } else {
      // Get list of skills with optional stats
      let query = `
        FOR skill IN skills
      `

      const bindVars = { limit: parseInt(limit), offset: parseInt(offset) }
      const filters = []

      if (category) {
        filters.push('skill.category == @category')
        bindVars.category = category
      }

      if (filters.length > 0) {
        query += ` FILTER ${filters.join(' AND ')}`
      }

      if (includeStats === 'true') {
        query += `
          LET jobSeekers = (
            FOR edge IN has_skill
              FILTER edge._to == skill._id
              RETURN 1
          )
          LET positions = (
            FOR edge IN requires
              FILTER edge._to == skill._id
              LET position = DOCUMENT(edge._from)
              RETURN position
          )
          LET activePositions = positions[* FILTER CURRENT.status == 'active']
          SORT skill.name ASC
          LIMIT @offset, @limit
          RETURN {
            id: skill._key,
            name: skill.name,
            category: skill.category,
            description: skill.description,
            icon: skill.icon,
            jobSeekers: LENGTH(jobSeekers),
            openPositions: LENGTH(activePositions),
            demand: LENGTH(activePositions) > 0 ? 
              MIN([100, (LENGTH(activePositions) / MAX([1, LENGTH(jobSeekers)])) * 100]) : 0,
            supply: LENGTH(jobSeekers),
            growth: skill.growth || 0
          }
        `
      } else {
        query += `
          SORT skill.name ASC
          LIMIT @offset, @limit
          RETURN {
            id: skill._key,
            name: skill.name,
            category: skill.category,
            description: skill.description,
            icon: skill.icon
          }
        `
      }

      const cursor = await db.query(query, bindVars)
      const skills = await cursor.all()

      res.status(200).json(skills)
    }
  } catch (error) {
    console.error('Error fetching skills:', error)
    res.status(500).json({ error: 'Failed to fetch skills' })
  }
}

async function handlePost(req, res, db, collections) {
  const { name, category, description, icon } = req.body

  if (!name || !category) {
    return res.status(400).json({
      error: 'Missing required fields: name, category'
    })
  }

  try {
    // Check if skill already exists
    const existingQuery = `
      FOR skill IN skills
        FILTER LOWER(skill.name) == LOWER(@name)
        RETURN skill
    `
    const existingCursor = await db.query(existingQuery, { name })
    const existing = await existingCursor.all()

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Skill with this name already exists' })
    }

    const skillData = {
      name,
      category,
      description: description || '',
      icon: icon || '🔧',
      growth: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collections.skills.save(skillData)

    res.status(201).json({
      id: result._key,
      ...skillData
    })
  } catch (error) {
    console.error('Error creating skill:', error)
    res.status(500).json({ error: 'Failed to create skill' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query
  const updateFields = req.body

  if (!id) {
    return res.status(400).json({ error: 'Skill ID is required' })
  }

  try {
    const updateData = {
      ...updateFields,
      updatedAt: new Date().toISOString()
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.createdAt

    const result = await collections.skills.update(id, updateData)

    if (!result._key) {
      return res.status(404).json({ error: 'Skill not found' })
    }

    res.status(200).json({
      id: result._key,
      ...updateData
    })
  } catch (error) {
    console.error('Error updating skill:', error)
    res.status(500).json({ error: 'Failed to update skill' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Skill ID is required' })
  }

  try {
    // Check if skill is being used
    const usageQuery = `
      LET hasSkillEdges = (
        FOR edge IN has_skill
          FILTER edge._to == @skillId
          RETURN edge
      )
      LET requiresEdges = (
        FOR edge IN requires
          FILTER edge._to == @skillId
          RETURN edge
      )
      RETURN {
        jobSeekers: LENGTH(hasSkillEdges),
        positions: LENGTH(requiresEdges)
      }
    `
    const usageCursor = await db.query(usageQuery, { skillId: `skills/${id}` })
    const usage = await usageCursor.all()

    if (usage[0].jobSeekers > 0 || usage[0].positions > 0) {
      return res.status(400).json({
        error: `Cannot delete skill that is being used by ${usage[0].jobSeekers} job seekers and ${usage[0].positions} positions`
      })
    }

    // Delete the skill
    await collections.skills.remove(id)

    res.status(200).json({ message: 'Skill deleted successfully' })
  } catch (error) {
    if (error.errorNum === 1202) { // Document not found
      return res.status(404).json({ error: 'Skill not found' })
    }
    console.error('Error deleting skill:', error)
    res.status(500).json({ error: 'Failed to delete skill' })
  }
}

// Additional endpoint for skill analytics
export async function getSkillAnalytics(req, res, db, collections) {
  try {
    const query = `
      FOR skill IN skills
        LET jobSeekers = (
          FOR edge IN has_skill
            FILTER edge._to == skill._id
            RETURN 1
        )
        LET positions = (
          FOR edge IN requires
            FILTER edge._to == skill._id
            LET position = DOCUMENT(edge._from)
            RETURN position
        )
        LET activePositions = positions[* FILTER CURRENT.status == 'active']
        LET demand = LENGTH(activePositions)
        LET supply = LENGTH(jobSeekers)
        
        RETURN {
          skill: skill.name,
          category: skill.category,
          demand: demand,
          supply: supply,
          ratio: supply > 0 ? demand / supply : 0,
          gap: demand - supply
        }
    `

    const cursor = await db.query(query)
    const analytics = await cursor.all()

    // Calculate market insights
    const insights = {
      totalSkills: analytics.length,
      highDemandSkills: analytics.filter(s => s.demand > s.supply).length,
      oversuppliedSkills: analytics.filter(s => s.supply > s.demand * 2).length,
      balancedSkills: analytics.filter(s => Math.abs(s.demand - s.supply) <= 2).length,
      topDemandSkills: analytics.sort((a, b) => b.demand - a.demand).slice(0, 10),
      topSupplySkills: analytics.sort((a, b) => b.supply - a.supply).slice(0, 10),
      biggestGaps: analytics.sort((a, b) => b.gap - a.gap).slice(0, 10)
    }

    res.status(200).json(insights)
  } catch (error) {
    console.error('Error fetching skill analytics:', error)
    res.status(500).json({ error: 'Failed to fetch skill analytics' })
  }
}
