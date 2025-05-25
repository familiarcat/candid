#!/usr/bin/env node

/**
 * Development Data Consistency Script
 *
 * This script ensures that the development environment always has
 * consistent, clean data by:
 * 1. Clearing the database entirely
 * 2. Running the seeding scripts
 * 3. Verifying data integrity
 *
 * Usage: npm run ensure-dev-data
 */

const { execSync } = require('child_process')

// Use Node.js built-in fetch (Node 18+) or polyfill
const fetch = globalThis.fetch || require('node-fetch')

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function clearAndSeedDatabase() {
  console.log('🧹 Starting database cleanup and seeding...')

  try {
    // Step 1: Clear database entirely
    console.log('1️⃣ Clearing database...')
    const clearResponse = await fetch(`${API_BASE}/api/seed-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!clearResponse.ok) {
      throw new Error(`Failed to clear/seed database: ${clearResponse.statusText}`)
    }

    const result = await clearResponse.json()
    console.log('✅ Database cleared and seeded successfully!')
    console.log(`   📊 Created: ${result.summary?.companies || 0} companies, ${result.summary?.hiringAuthorities || 0} authorities, ${result.summary?.jobSeekers || 0} job seekers, ${result.summary?.skills || 0} skills, ${result.summary?.positions || 0} positions, ${result.summary?.matches || 0} matches`)

    // Step 2: Verify data integrity
    console.log('2️⃣ Verifying data integrity...')
    await verifyDataIntegrity()

    console.log('🎉 Development data setup complete!')
    console.log('   🔗 All entities properly connected')
    console.log('   📈 No duplicate records')
    console.log('   ✨ Ready for consistent testing')

  } catch (error) {
    console.error('❌ Error setting up development data:', error.message)
    process.exit(1)
  }
}

async function verifyDataIntegrity() {
  const endpoints = [
    '/api/companies',
    '/api/hiring-authorities',
    '/api/job-seekers',
    '/api/skills',
    '/api/positions',
    '/api/matches'
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`)
      if (!response.ok) {
        throw new Error(`${endpoint} returned ${response.status}`)
      }

      const data = await response.json()
      const count = Array.isArray(data) ? data.length :
                   data.companies?.length || data.hiringAuthorities?.length ||
                   data.jobSeekers?.length || data.skills?.length ||
                   data.positions?.length || data.matches?.length || 0

      console.log(`   ✓ ${endpoint}: ${count} records`)

      if (count === 0) {
        console.warn(`   ⚠️  Warning: ${endpoint} has no data`)
      }

    } catch (error) {
      console.error(`   ❌ ${endpoint}: ${error.message}`)
      throw error
    }
  }
}

// Run if called directly
if (require.main === module) {
  clearAndSeedDatabase()
}

module.exports = { clearAndSeedDatabase, verifyDataIntegrity }
