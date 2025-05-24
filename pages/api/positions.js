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
  const { 
    id, 
    companyId, 
    level, 
    type, 
    status, 
    remote, 
    location,
    limit = 50, 
    offset = 0 
  } = req.query

  try {
    if (id) {
      // Get single position with related data
      const query = `
        LET position = DOCUMENT('positions', @id)
        LET company = DOCUMENT(position.companyId)
        LET requirements = (
          FOR req IN requires
            FILTER req._from == position._id
            LET skill = DOCUMENT(req._to)
            RETURN skill.name
        )
        LET matches = (
          FOR match IN matches
            FILTER match.positionId == position._id
            RETURN {
              id: match._key,
              jobSeekerId: match.jobSeekerId,
              score: match.score,
              status: match.status
            }
        )
        RETURN {
          id: position._key,
          title: position.title,
          company: {
            id: company._key,
            name: company.name,
            logo: company.logo
          },
          level: position.level,
          type: position.type,
          location: position.location,
          remote: position.remote,
          salary: position.salary,
          description: position.description,
          requirements: requirements,
          benefits: position.benefits || [],
          status: position.status,
          postedDate: position.postedDate,
          applicants: position.applicants || 0,
          matches: matches
        }
      `

      const cursor = await db.query(query, { id })
      const result = await cursor.all()

      if (result.length === 0) {
        return res.status(404).json({ error: 'Position not found' })
      }

      res.status(200).json(result[0])
    } else {
      // Get list of positions with filters
      let query = `
        FOR position IN positions
          LET company = DOCUMENT(position.companyId)
      `

      const bindVars = { limit: parseInt(limit), offset: parseInt(offset) }
      const filters = []

      if (companyId) {
        filters.push('position.companyId == @companyId')
        bindVars.companyId = companyId
      }
      if (level) {
        filters.push('position.level == @level')
        bindVars.level = level
      }
      if (type) {
        filters.push('position.type == @type')
        bindVars.type = type
      }
      if (status) {
        filters.push('position.status == @status')
        bindVars.status = status
      }
      if (remote !== undefined) {
        filters.push('position.remote == @remote')
        bindVars.remote = remote === 'true'
      }
      if (location) {
        filters.push('CONTAINS(LOWER(position.location), LOWER(@location))')
        bindVars.location = location
      }

      if (filters.length > 0) {
        query += ` FILTER ${filters.join(' AND ')}`
      }

      query += `
        LET requirements = (
          FOR req IN requires
            FILTER req._from == position._id
            LET skill = DOCUMENT(req._to)
            RETURN skill.name
        )
        SORT position.postedDate DESC
        LIMIT @offset, @limit
        RETURN {
          id: position._key,
          title: position.title,
          company: {
            id: company._key,
            name: company.name,
            logo: company.logo
          },
          level: position.level,
          type: position.type,
          location: position.location,
          remote: position.remote,
          salary: position.salary,
          description: position.description,
          requirements: requirements,
          benefits: position.benefits || [],
          status: position.status,
          postedDate: position.postedDate,
          applicants: position.applicants || 0
        }
      `

      const cursor = await db.query(query, bindVars)
      const positions = await cursor.all()

      res.status(200).json(positions)
    }
  } catch (error) {
    console.error('Error fetching positions:', error)
    res.status(500).json({ error: 'Failed to fetch positions' })
  }
}

async function handlePost(req, res, db, collections) {
  const {
    title,
    companyId,
    level,
    type,
    location,
    remote,
    salary,
    description,
    requirements,
    benefits
  } = req.body

  if (!title || !companyId || !level || !type || !location) {
    return res.status(400).json({
      error: 'Missing required fields: title, companyId, level, type, location'
    })
  }

  try {
    // Verify company exists
    try {
      await collections.companies.document(companyId)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid company ID' })
    }

    const positionData = {
      title,
      companyId: `companies/${companyId}`,
      level,
      type,
      location,
      remote: remote || false,
      salary: salary || '',
      description: description || '',
      benefits: benefits || [],
      status: 'active',
      postedDate: new Date().toISOString(),
      applicants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collections.positions.save(positionData)

    // Create skill requirement relationships
    if (requirements && requirements.length > 0) {
      for (const skillName of requirements) {
        // Find or create skill
        let skillQuery = `
          FOR skill IN skills
            FILTER LOWER(skill.name) == LOWER(@skillName)
            RETURN skill
        `
        let skillCursor = await db.query(skillQuery, { skillName })
        let skills = await skillCursor.all()

        let skillId
        if (skills.length === 0) {
          // Create new skill
          const skillResult = await collections.skills.save({
            name: skillName,
            category: 'General',
            createdAt: new Date().toISOString()
          })
          skillId = skillResult._id
        } else {
          skillId = skills[0]._id
        }

        // Create requirement relationship
        await collections.requires.save({
          _from: result._id,
          _to: skillId,
          createdAt: new Date().toISOString()
        })
      }
    }

    res.status(201).json({
      id: result._key,
      ...positionData,
      requirements: requirements || []
    })
  } catch (error) {
    console.error('Error creating position:', error)
    res.status(500).json({ error: 'Failed to create position' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query
  const updateFields = req.body

  if (!id) {
    return res.status(400).json({ error: 'Position ID is required' })
  }

  try {
    const updateData = {
      ...updateFields,
      updatedAt: new Date().toISOString()
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.createdAt
    delete updateData.postedDate

    // Handle requirements update separately
    const requirements = updateData.requirements
    delete updateData.requirements

    const result = await collections.positions.update(id, updateData)

    if (!result._key) {
      return res.status(404).json({ error: 'Position not found' })
    }

    // Update requirements if provided
    if (requirements) {
      const positionId = `positions/${id}`
      
      // Remove existing requirements
      await db.query(`
        FOR req IN requires
          FILTER req._from == @positionId
          REMOVE req IN requires
      `, { positionId })

      // Add new requirements
      for (const skillName of requirements) {
        let skillQuery = `
          FOR skill IN skills
            FILTER LOWER(skill.name) == LOWER(@skillName)
            RETURN skill
        `
        let skillCursor = await db.query(skillQuery, { skillName })
        let skills = await skillCursor.all()

        let skillId
        if (skills.length === 0) {
          const skillResult = await collections.skills.save({
            name: skillName,
            category: 'General',
            createdAt: new Date().toISOString()
          })
          skillId = skillResult._id
        } else {
          skillId = skills[0]._id
        }

        await collections.requires.save({
          _from: positionId,
          _to: skillId,
          createdAt: new Date().toISOString()
        })
      }
    }

    res.status(200).json({
      id: result._key,
      ...updateData,
      requirements: requirements || []
    })
  } catch (error) {
    console.error('Error updating position:', error)
    res.status(500).json({ error: 'Failed to update position' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Position ID is required' })
  }

  try {
    // Check if position has active matches
    const matchesQuery = `
      FOR match IN matches
        FILTER match.positionId == @positionId AND match.status == 'pending'
        RETURN match
    `
    const matchesCursor = await db.query(matchesQuery, { positionId: `positions/${id}` })
    const activeMatches = await matchesCursor.all()

    if (activeMatches.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete position with pending matches. Please resolve matches first.'
      })
    }

    // Delete the position
    await collections.positions.remove(id)

    // Clean up related data
    const positionId = `positions/${id}`
    const cleanupQueries = [
      // Delete skill requirements
      `
        FOR req IN requires
          FILTER req._from == @positionId
          REMOVE req IN requires
      `,
      // Delete posting relationships
      `
        FOR edge IN posts
          FILTER edge._to == @positionId
          REMOVE edge IN posts
      `,
      // Delete completed matches
      `
        FOR match IN matches
          FILTER match.positionId == @positionId
          REMOVE match IN matches
      `
    ]

    for (const query of cleanupQueries) {
      await db.query(query, { positionId })
    }

    res.status(200).json({ message: 'Position deleted successfully' })
  } catch (error) {
    if (error.errorNum === 1202) { // Document not found
      return res.status(404).json({ error: 'Position not found' })
    }
    console.error('Error deleting position:', error)
    res.status(500).json({ error: 'Failed to delete position' })
  }
}
