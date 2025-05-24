import initDb from '../../lib/db'

export default async function handler(req, res) {
  try {
    const { db, collections } = await initDb()
    const { jobSeekers } = collections
    
    switch (req.method) {
      case 'GET':
        const cursor = await jobSeekers.all()
        const result = await cursor.all()
        return res.status(200).json(result)
        
      case 'POST':
        const newJobSeeker = req.body
        const saved = await jobSeekers.save(newJobSeeker)
        return res.status(201).json(saved)
        
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error handling job seekers:', error)
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}