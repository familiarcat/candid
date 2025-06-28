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
  const { id, role, companySize, industry, limit = 50, offset = 0 } = req.query

  try {
    if (id) {
      // Get single hiring authority with related data
      const query = `
        LET authority = DOCUMENT('hiringAuthorities', @id)
        LET company = DOCUMENT('companies', authority.companyId)
        LET positions = (
          FOR pos IN positions
            FILTER pos.hiringAuthorityId == authority._id
            RETURN {
              id: pos._key,
              title: pos.title,
              level: pos.level,
              type: pos.type,
              status: pos.status,
              requirements: pos.requirements || []
            }
        )
        LET matches = (
          FOR match IN matches
            FILTER match.hiringAuthorityId == authority._id
            LET jobSeeker = DOCUMENT('jobSeekers', match.jobSeekerId)
            RETURN {
              id: match._key,
              jobSeeker: {
                id: jobSeeker._key,
                name: jobSeeker.name,
                title: jobSeeker.currentTitle
              },
              score: match.score,
              status: match.status
            }
        )
        RETURN {
          id: authority._key,
          name: authority.name,
          role: authority.role,
          level: authority.level,
          email: authority.email,
          phone: authority.phone,
          hiringPower: authority.hiringPower,
          decisionMaker: authority.decisionMaker,
          company: {
            id: company._key,
            name: company.name,
            size: company.size,
            industry: company.industry
          },
          positions: positions,
          matches: matches,
          skillsLookingFor: authority.skillsLookingFor || [],
          preferredExperience: authority.preferredExperience,
          bio: authority.bio,
          linkedIn: authority.linkedIn
        }
      `

      const cursor = await db.query(query, { id })
      const result = await cursor.next()

      if (!result) {
        return res.status(404).json({ error: 'Hiring authority not found' })
      }

      return res.status(200).json(result)
    } else {
      // Get all hiring authorities with filters
      let filterConditions = []
      let bindVars = { limit: parseInt(limit), offset: parseInt(offset) }

      if (role) {
        filterConditions.push('LOWER(auth.role) LIKE @role')
        bindVars.role = `%${role.toLowerCase()}%`
      }

      if (industry) {
        filterConditions.push('LOWER(company.industry) LIKE @industry')
        bindVars.industry = `%${industry.toLowerCase()}%`
      }

      if (companySize) {
        filterConditions.push('company.size == @companySize')
        bindVars.companySize = companySize
      }

      const whereClause = filterConditions.length > 0
        ? `FILTER ${filterConditions.join(' AND ')}`
        : ''

      const query = `
        FOR auth IN hiringAuthorities
          LET company = DOCUMENT('companies', auth.companyId)
          ${whereClause}
          LET activePositions = LENGTH(
            FOR pos IN positions
              FILTER pos.hiringAuthorityId == auth._id AND pos.status == 'active'
              RETURN 1
          )
          SORT auth.hiringPower DESC, auth.name ASC
          LIMIT @offset, @limit
          RETURN {
            id: auth._key,
            name: auth.name,
            role: auth.role,
            level: auth.level,
            email: auth.email,
            hiringPower: auth.hiringPower,
            decisionMaker: auth.decisionMaker,
            company: {
              id: company._key,
              name: company.name,
              size: company.size,
              industry: company.industry
            },
            activePositions: activePositions,
            skillsLookingFor: auth.skillsLookingFor || [],
            preferredExperience: auth.preferredExperience,
            avatar: auth.avatar || '👔'
          }
      `

      const cursor = await db.query(query, bindVars)
      const authorities = await cursor.all()

      // Get total count for pagination
      const countQuery = `
        FOR auth IN hiringAuthorities
          LET company = DOCUMENT('companies', auth.companyId)
          ${whereClause}
          COLLECT WITH COUNT INTO total
          RETURN total
      `

      // Create bind vars for count query (exclude limit and offset)
      const countBindVars = { ...bindVars }
      delete countBindVars.limit
      delete countBindVars.offset

      const countCursor = await db.query(countQuery, countBindVars)
      const totalCount = await countCursor.next() || 0

      return res.status(200).json({
        authorities,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + authorities.length < totalCount
        }
      })
    }
  } catch (error) {
    console.error('Error fetching hiring authorities:', error)
    return res.status(500).json({ error: 'Failed to fetch hiring authorities' })
  }
}

async function handlePost(req, res, db, collections) {
  try {
    const { hiringAuthorities } = collections
    const authorityData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await hiringAuthorities.save(authorityData)

    return res.status(201).json({
      id: result._key,
      ...authorityData
    })
  } catch (error) {
    console.error('Error creating hiring authority:', error)
    return res.status(500).json({ error: 'Failed to create hiring authority' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Authority ID is required' })
  }

  try {
    const { hiringAuthorities } = collections
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    const result = await hiringAuthorities.update(id, updateData)

    return res.status(200).json({
      id: result._key,
      ...updateData
    })
  } catch (error) {
    console.error('Error updating hiring authority:', error)
    return res.status(500).json({ error: 'Failed to update hiring authority' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Authority ID is required' })
  }

  try {
    const { hiringAuthorities } = collections
    await hiringAuthorities.remove(id)

    return res.status(200).json({ message: 'Hiring authority deleted successfully' })
  } catch (error) {
    console.error('Error deleting hiring authority:', error)
    return res.status(500).json({ error: 'Failed to delete hiring authority' })
  }
}
