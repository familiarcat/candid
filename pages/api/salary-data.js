// API endpoint for OpenAI-powered salary data
import { generateRealisticSalaryData, generateBatchSalaryData, getCachedSalaryData } from '../../lib/openaiSalaryService'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (req.method === 'GET') {
      // Single skill salary lookup
      const { 
        skillName, 
        category, 
        location = 'United States',
        experienceLevel = 'Mid',
        demandLevel = 70,
        useCache = 'true'
      } = req.query

      if (!skillName || !category) {
        return res.status(400).json({ 
          error: 'Missing required parameters: skillName and category' 
        })
      }

      let salaryData
      
      if (useCache === 'true') {
        salaryData = await getCachedSalaryData(skillName, category, {
          location,
          experienceLevel,
          demandLevel: parseInt(demandLevel)
        })
      } else {
        salaryData = await generateRealisticSalaryData({
          skillName,
          category,
          location,
          experienceLevel,
          demandLevel: parseInt(demandLevel)
        })
      }

      return res.status(200).json({
        success: true,
        data: salaryData
      })

    } else if (req.method === 'POST') {
      // Batch salary generation
      const { skills, options = {} } = req.body

      if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ 
          error: 'Missing or invalid skills array' 
        })
      }

      if (skills.length > 10) {
        return res.status(400).json({ 
          error: 'Maximum 10 skills per batch request' 
        })
      }

      const results = await generateBatchSalaryData(skills, options)

      return res.status(200).json({
        success: true,
        data: results,
        processed: results.length,
        errors: results.filter(r => r.error).length
      })
    }

  } catch (error) {
    console.error('Salary data API error:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to generate salary data'
    })
  }
}

// Example usage:
// GET /api/salary-data?skillName=React&category=Frontend&experienceLevel=Senior&location=San Francisco
// POST /api/salary-data with body: { skills: [{ name: 'React', category: 'Frontend' }], options: { location: 'NYC' } }
