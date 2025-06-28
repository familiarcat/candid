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
  const { id, skills, experience, location, limit = 50, offset = 0 } = req.query

  try {
    if (id) {
      // Get single job seeker with enhanced data
      const query = `
        LET jobSeeker = DOCUMENT('jobSeekers', @id)
        LET skillDetails = (
          FOR skillName IN jobSeeker.skills || []
            FOR skill IN skills
              FILTER LOWER(skill.name) == LOWER(skillName)
              RETURN {
                name: skill.name,
                category: skill.category,
                level: jobSeeker.skillLevels[skillName] || 5
              }
        )
        LET matches = (
          FOR match IN matches
            FILTER match.jobSeekerId == jobSeeker._id
            SORT match.score DESC
            LIMIT 10
            RETURN {
              id: match._key,
              score: match.score,
              status: match.status,
              authorityId: match.authorityId
            }
        )
        RETURN {
          id: jobSeeker._key,
          name: jobSeeker.name,
          email: jobSeeker.email,
          currentTitle: jobSeeker.currentTitle,
          experience: jobSeeker.experience,
          location: jobSeeker.location,
          skills: jobSeeker.skills || [],
          skillLevels: jobSeeker.skillLevels || {},
          skillDetails: skillDetails,
          desiredRole: jobSeeker.desiredRole,
          salaryExpectation: jobSeeker.salaryExpectation,
          remote: jobSeeker.remote,
          bio: jobSeeker.bio,
          matches: matches,
          avatar: jobSeeker.avatar || '👤'
        }
      `

      const cursor = await db.query(query, { id })
      const result = await cursor.all()

      if (result.length === 0) {
        return res.status(404).json({ error: 'Job seeker not found' })
      }

      res.status(200).json(result[0])
    } else {
      // Get list of job seekers with filters
      let query = `FOR jobSeeker IN jobSeekers`
      let bindVars = { offset: parseInt(offset), limit: parseInt(limit) }

      // Add filters
      const filters = []
      if (skills) {
        filters.push(`@skills IN jobSeeker.skills`)
        bindVars.skills = skills
      }
      if (experience) {
        filters.push(`jobSeeker.experience >= @experience`)
        bindVars.experience = parseInt(experience)
      }
      if (location) {
        filters.push(`CONTAINS(LOWER(jobSeeker.location), LOWER(@location))`)
        bindVars.location = location
      }

      if (filters.length > 0) {
        query += ` FILTER ${filters.join(' AND ')}`
      }

      query += `
        SORT jobSeeker.name ASC
        LIMIT @offset, @limit
        RETURN {
          id: jobSeeker._key,
          name: jobSeeker.name,
          email: jobSeeker.email,
          currentTitle: jobSeeker.currentTitle,
          experience: jobSeeker.experience,
          location: jobSeeker.location,
          skills: jobSeeker.skills || [],
          skillLevels: jobSeeker.skillLevels || {},
          desiredRole: jobSeeker.desiredRole,
          salaryExpectation: jobSeeker.salaryExpectation,
          remote: jobSeeker.remote,
          bio: jobSeeker.bio,
          avatar: jobSeeker.avatar || '👤'
        }
      `

      const cursor = await db.query(query, bindVars)
      const jobSeekers = await cursor.all()

      res.status(200).json(jobSeekers)
    }
  } catch (error) {
    console.error('Error fetching job seekers:', error)
    res.status(500).json({ error: 'Failed to fetch job seekers' })
  }
}

async function handlePost(req, res, db, collections) {
  const { name, email, currentTitle, experience, location, skills, desiredRole, salaryExpectation, remote, bio } = req.body

  if (!name || !email || !currentTitle) {
    return res.status(400).json({ error: 'Missing required fields: name, email, currentTitle' })
  }

  try {
    const jobSeekerData = {
      name,
      email,
      currentTitle,
      experience: experience || 0,
      location: location || '',
      skills: skills || [],
      skillLevels: {},
      desiredRole: desiredRole || '',
      salaryExpectation: salaryExpectation || 0,
      remote: remote || false,
      bio: bio || '',
      avatar: '👤',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collections.jobSeekers.save(jobSeekerData)

    res.status(201).json({
      id: result._key,
      ...jobSeekerData
    })
  } catch (error) {
    console.error('Error creating job seeker:', error)
    res.status(500).json({ error: 'Failed to create job seeker' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query
  const updates = req.body

  if (!id) {
    return res.status(400).json({ error: 'Job seeker ID is required' })
  }

  try {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const result = await collections.jobSeekers.update(id, updateData)

    if (!result._key) {
      return res.status(404).json({ error: 'Job seeker not found' })
    }

    res.status(200).json({
      id: result._key,
      ...updateData
    })
  } catch (error) {
    console.error('Error updating job seeker:', error)
    res.status(500).json({ error: 'Failed to update job seeker' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Job seeker ID is required' })
  }

  try {
    await collections.jobSeekers.remove(id)
    res.status(200).json({ message: 'Job seeker deleted successfully' })
  } catch (error) {
    console.error('Error deleting job seeker:', error)
    res.status(500).json({ error: 'Failed to delete job seeker' })
  }
}