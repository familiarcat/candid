import { Database } from 'arangojs'

// Initialize the ArangoDB connection
const initDatabase = () => {
  const db = new Database({
    url: process.env.ARANGODB_URL || 'http://localhost:8529',
    databaseName: process.env.ARANGODB_DB_NAME || 'candid_connections',
    auth: {
      username: process.env.ARANGODB_USERNAME || 'root',
      password: process.env.ARANGODB_PASSWORD || '',
    },
  })
  
  return db
}

// Get collections
const getCollections = async (db) => {
  return {
    jobSeekers: db.collection('jobSeekers'),
    companies: db.collection('companies'),
    hiringAuthorities: db.collection('hiringAuthorities'),
    positions: db.collection('positions'),
    skills: db.collection('skills'),
    matches: db.collection('matches'),
    // Edge collections
    works_for: db.edgeCollection('works_for'),
    employs: db.edgeCollection('employs'),
    posts: db.edgeCollection('posts'),
    requires: db.edgeCollection('requires'),
    has_skill: db.edgeCollection('has_skill'),
    matched_to: db.edgeCollection('matched_to'),
  }
}

// Initialize database and collections
export const initDb = async () => {
  const db = initDatabase()
  const collections = await getCollections(db)
  return { db, collections }
}

export default initDb