import { Database } from 'arangojs'

// Get collections
const getCollections = async (db) => {
  return {
    jobSeekers: db.collection('jobSeekers'),
    companies: db.collection('companies'),
    hiringAuthorities: db.collection('hiringAuthorities'),
    positions: db.collection('positions'),
    skills: db.collection('skills'),
    matches: db.collection('matches'),
    // Edge collections - using regular collection method for now
    works_for: db.collection('works_for'),
    employs: db.collection('employs'),
    posts: db.collection('posts'),
    requires: db.collection('requires'),
    has_skill: db.collection('has_skill'),
    matched_to: db.collection('matched_to'),
    reports_to: db.collection('reports_to'),
  }
}

// Initialize database and collections
export const initDb = async () => {
  const dbName = process.env.ARANGODB_DB_NAME || 'candid_connections'

  // First connect to _system database to create our database
  const systemDb = new Database({
    url: process.env.ARANGODB_URL || 'http://localhost:8529',
    databaseName: '_system',
    auth: {
      username: process.env.ARANGODB_USERNAME || 'root',
      password: process.env.ARANGODB_PASSWORD || '',
    },
  })

  // Ensure our database exists
  try {
    await systemDb.createDatabase(dbName)
    console.log(`✅ Created database: ${dbName}`)
  } catch (error) {
    if (error.errorNum === 1207) {
      console.log(`✅ Database ${dbName} already exists`)
    } else {
      console.log('Database creation note:', error.message)
    }
  }

  // Now connect to our specific database
  const db = new Database({
    url: process.env.ARANGODB_URL || 'http://localhost:8529',
    databaseName: dbName,
    auth: {
      username: process.env.ARANGODB_USERNAME || 'root',
      password: process.env.ARANGODB_PASSWORD || '',
    },
  })

  const collections = await getCollections(db)
  return { db, collections }
}

export default initDb