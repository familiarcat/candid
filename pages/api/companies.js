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
  const { id, industry, size, location, limit = 50, offset = 0 } = req.query

  try {
    if (id) {
      // Get single company with related data
      const query = `
        LET company = DOCUMENT('companies', @id)
        LET positions = (
          FOR pos IN positions
            FILTER pos.companyId == company._id
            RETURN {
              id: pos._key,
              title: pos.title,
              level: pos.level,
              type: pos.type,
              status: pos.status,
              applicants: pos.applicants || 0
            }
        )
        LET hiringAuthorities = (
          FOR auth IN hiringAuthorities
            FILTER auth.companyId == company._id
            RETURN {
              id: auth._key,
              name: auth.name,
              role: auth.role,
              email: auth.email
            }
        )
        RETURN {
          id: company._key,
          name: company.name,
          industry: company.industry,
          size: company.size,
          location: company.location,
          description: company.description,
          founded: company.founded,
          website: company.website,
          logo: company.logo,
          positions: positions,
          hiringAuthorities: hiringAuthorities,
          openPositions: LENGTH(positions[* FILTER CURRENT.status == 'active'])
        }
      `

      const cursor = await db.query(query, { id })
      const result = await cursor.all()

      if (result.length === 0) {
        return res.status(404).json({ error: 'Company not found' })
      }

      res.status(200).json(result[0])
    } else {
      // Get list of companies with filters
      let query = `
        FOR company IN companies
      `

      const bindVars = { limit: parseInt(limit), offset: parseInt(offset) }
      const filters = []

      if (industry) {
        filters.push('company.industry == @industry')
        bindVars.industry = industry
      }
      if (size) {
        filters.push('company.size == @size')
        bindVars.size = size
      }
      if (location) {
        filters.push('CONTAINS(LOWER(company.location), LOWER(@location))')
        bindVars.location = location
      }

      if (filters.length > 0) {
        query += ` FILTER ${filters.join(' AND ')}`
      }

      query += `
        LET openPositions = LENGTH(
          FOR pos IN positions
            FILTER pos.companyId == company._id AND pos.status == 'active'
            RETURN 1
        )
        LET hiringAuthorities = (
          FOR auth IN hiringAuthorities
            FILTER auth.companyId == company._id
            RETURN {
              id: auth._key,
              name: auth.name,
              role: auth.role,
              email: auth.email
            }
        )
        SORT company.name ASC
        LIMIT @offset, @limit
        RETURN {
          id: company._key,
          name: company.name,
          industry: company.industry,
          size: company.size,
          location: company.location,
          description: company.description,
          founded: company.founded,
          website: company.website,
          logo: company.logo,
          openPositions: openPositions,
          hiringAuthorities: hiringAuthorities
        }
      `

      const cursor = await db.query(query, bindVars)
      const companies = await cursor.all()

      res.status(200).json(companies)
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    res.status(500).json({ error: 'Failed to fetch companies' })
  }
}

async function handlePost(req, res, db, collections) {
  const {
    name,
    industry,
    size,
    location,
    description,
    founded,
    website,
    logo
  } = req.body

  if (!name || !industry || !size || !location) {
    return res.status(400).json({
      error: 'Missing required fields: name, industry, size, location'
    })
  }

  try {
    // Check if company already exists
    const existingQuery = `
      FOR company IN companies
        FILTER LOWER(company.name) == LOWER(@name)
        RETURN company
    `
    const existingCursor = await db.query(existingQuery, { name })
    const existing = await existingCursor.all()

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Company with this name already exists' })
    }

    const companyData = {
      name,
      industry,
      size,
      location,
      description: description || '',
      founded: founded || null,
      website: website || '',
      logo: logo || '🏢',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collections.companies.save(companyData)

    res.status(201).json({
      id: result._key,
      ...companyData
    })
  } catch (error) {
    console.error('Error creating company:', error)
    res.status(500).json({ error: 'Failed to create company' })
  }
}

async function handlePut(req, res, db, collections) {
  const { id } = req.query
  const updateFields = req.body

  if (!id) {
    return res.status(400).json({ error: 'Company ID is required' })
  }

  try {
    const updateData = {
      ...updateFields,
      updatedAt: new Date().toISOString()
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.createdAt

    const result = await collections.companies.update(id, updateData)

    if (!result._key) {
      return res.status(404).json({ error: 'Company not found' })
    }

    res.status(200).json({
      id: result._key,
      ...updateData
    })
  } catch (error) {
    console.error('Error updating company:', error)
    res.status(500).json({ error: 'Failed to update company' })
  }
}

async function handleDelete(req, res, db, collections) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Company ID is required' })
  }

  try {
    // Check if company has active positions
    const positionsQuery = `
      FOR pos IN positions
        FILTER pos.companyId == @companyId AND pos.status == 'active'
        RETURN pos
    `
    const positionsCursor = await db.query(positionsQuery, { companyId: `companies/${id}` })
    const activePositions = await positionsCursor.all()

    if (activePositions.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete company with active positions. Please close all positions first.'
      })
    }

    // Delete the company
    await collections.companies.remove(id)

    // Clean up related data
    const cleanupQueries = [
      // Delete hiring authorities
      `
        FOR auth IN hiringAuthorities
          FILTER auth.companyId == @companyId
          REMOVE auth IN hiringAuthorities
      `,
      // Delete employment relationships
      `
        FOR edge IN employs
          FILTER STARTS_WITH(edge._from, @companyId)
          REMOVE edge IN employs
      `
    ]

    for (const query of cleanupQueries) {
      await db.query(query, { companyId: `companies/${id}` })
    }

    res.status(200).json({ message: 'Company deleted successfully' })
  } catch (error) {
    if (error.errorNum === 1202) { // Document not found
      return res.status(404).json({ error: 'Company not found' })
    }
    console.error('Error deleting company:', error)
    res.status(500).json({ error: 'Failed to delete company' })
  }
}
