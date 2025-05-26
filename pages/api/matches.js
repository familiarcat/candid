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
  const { status, jobSeekerId, hiringAuthorityId, limit = 50, offset = 0 } = req.query

  try {
    let query = `
      FOR match IN matches
        LET jobSeeker = DOCUMENT(match.jobSeekerId)
        LET hiringAuthority = DOCUMENT(match.hiringAuthorityId)
        LET company = DOCUMENT(match.companyId)
    `

    const bindVars = { limit: parseInt(limit), offset: parseInt(offset) }

    // Add filters
    const filters = []
    if (status) {
      filters.push('match.status == @status')
      bindVars.status = status
    }
    if (jobSeekerId) {
      filters.push('match.jobSeekerId == @jobSeekerId')
      bindVars.jobSeekerId = jobSeekerId
    }
    if (hiringAuthorityId) {
      filters.push('match.hiringAuthorityId == @hiringAuthorityId')
      bindVars.hiringAuthorityId = hiringAuthorityId
    }

    if (filters.length > 0) {
      query += ` FILTER ${filters.join(' AND ')}`
    }

    query += `
        SORT (match.matchScore || match.score) DESC, match.createdAt DESC
        LIMIT @offset, @limit
        RETURN {
          id: match._key,
          jobSeeker: {
            id: jobSeeker._key,
            name: jobSeeker.name,
            title: jobSeeker.currentTitle || jobSeeker.title,
            skills: jobSeeker.skills || [],
            experience: jobSeeker.experience
          },
          hiringAuthority: {
            id: hiringAuthority._key,
            name: hiringAuthority.name,
            role: hiringAuthority.role,
            level: hiringAuthority.level,
            company: company.name,
            hiringPower: hiringAuthority.hiringPower,
            decisionMaker: hiringAuthority.decisionMaker,
            skillsLookingFor: hiringAuthority.skillsLookingFor || []
          },
          matchScore: match.matchScore || match.score,
          status: match.status,
          createdAt: match.createdAt,
          matchReasons: match.matchReasons || [],
          hierarchyMatch: match.hierarchyMatch,
          connectionStrength: match.connectionStrength
        }
    `

    const cursor = await db.query(query, bindVars)
    const matches = await cursor.all()

    res.status(200).json({ matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    res.status(500).json({ error: 'Failed to fetch matches' })
  }
}

async function handlePost(req, res, db, collections) {
  const { jobSeekerId, positionId, score, matchReasons } = req.body

  if (!jobSeekerId || !positionId || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields: jobSeekerId, positionId, score' })
  }

  try {
    // Check if match already exists
    const existingQuery = `
      FOR match IN matches
        FILTER match.jobSeekerId == @jobSeekerId AND match.positionId == @positionId
        RETURN match
    `
    const existingCursor = await db.query(existingQuery, { jobSeekerId, positionId })
    const existing = await existingCursor.all()

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Match already exists' })
    }

    // Create new match
    const matchData = {
      jobSeekerId,
      positionId,
      score,
      status: 'pending',
      matchReasons: matchReasons || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collections.matches.save(matchData)

    // Create relationship edge
    await collections.matched_to.save({
      _from: jobSeekerId,
      _to: positionId,
      matchId: result._id,
      score,
      createdAt: new Date().toISOString()
    })

    res.status(201).json({
      id: result._key,
      ...matchData
    })
  } catch (error) {
    console.error('Error creating match:', error)
    res.status(500).json({ error: 'Failed to create match' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query
  const { status, score, matchReasons } = req.body

  if (!id) {
    return res.status(400).json({ error: 'Match ID is required' })
  }

  try {
    const updateData = {
      updatedAt: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (score !== undefined) updateData.score = score
    if (matchReasons) updateData.matchReasons = matchReasons

    const result = await collections.matches.update(id, updateData)

    if (!result._key) {
      return res.status(404).json({ error: 'Match not found' })
    }

    res.status(200).json({
      id: result._key,
      ...updateData
    })
  } catch (error) {
    console.error('Error updating match:', error)
    res.status(500).json({ error: 'Failed to update match' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Match ID is required' })
  }

  try {
    // Get match details before deletion
    const match = await collections.matches.document(id)

    // Delete the match
    await collections.matches.remove(id)

    // Delete related edges
    const edgeQuery = `
      FOR edge IN matched_to
        FILTER edge.matchId == @matchId
        REMOVE edge IN matched_to
    `
    await db.query(edgeQuery, { matchId: `matches/${id}` })

    res.status(200).json({ message: 'Match deleted successfully' })
  } catch (error) {
    if (error.errorNum === 1202) { // Document not found
      return res.status(404).json({ error: 'Match not found' })
    }
    console.error('Error deleting match:', error)
    res.status(500).json({ error: 'Failed to delete match' })
  }
}
