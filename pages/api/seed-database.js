import { seedDatabase } from '../../scripts/seedDatabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🌱 Starting database seeding...')
    const result = await seedDatabase()
    
    if (result.success) {
      return res.status(200).json({
        message: 'Database seeded successfully',
        stats: result.stats
      })
    } else {
      return res.status(500).json({
        error: 'Failed to seed database',
        details: result.error
      })
    }
  } catch (error) {
    console.error('Error in seed API:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
