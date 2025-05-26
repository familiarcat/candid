#!/usr/bin/env node

// Regenerate matches with enhanced matching algorithm
const { initDb } = require('../lib/db')
const { generateAllMatches } = require('../lib/matchingAlgorithm')

async function regenerateMatches() {
  console.log('🔄 Starting match regeneration with enhanced algorithm...')
  
  try {
    const { db, collections } = await initDb()
    
    // 1. Fetch all data
    console.log('📊 Fetching job seekers, hiring authorities, and companies...')
    
    const jobSeekersQuery = 'FOR js IN jobSeekers RETURN js'
    const authoritiesQuery = 'FOR ha IN hiringAuthorities RETURN ha'
    const companiesQuery = 'FOR c IN companies RETURN c'
    
    const [jobSeekersCursor, authoritiesCursor, companiesCursor] = await Promise.all([
      db.query(jobSeekersQuery),
      db.query(authoritiesQuery),
      db.query(companiesQuery)
    ])
    
    const [jobSeekers, hiringAuthorities, companies] = await Promise.all([
      jobSeekersCursor.all(),
      authoritiesCursor.all(),
      companiesCursor.all()
    ])
    
    console.log(`✅ Found ${jobSeekers.length} job seekers, ${hiringAuthorities.length} authorities, ${companies.length} companies`)
    
    // 2. Clear existing matches
    console.log('🗑️ Clearing existing matches...')
    await collections.matches.truncate()
    
    // 3. Generate new matches with enhanced algorithm
    console.log('🧠 Generating enhanced matches...')
    const newMatches = await generateAllMatches(jobSeekers, hiringAuthorities, companies)
    
    console.log(`🎯 Generated ${newMatches.length} enhanced matches`)
    
    // 4. Insert new matches
    if (newMatches.length > 0) {
      console.log('💾 Saving enhanced matches to database...')
      await collections.matches.saveAll(newMatches)
      console.log('✅ Enhanced matches saved successfully!')
    }
    
    // 5. Show sample of best matches
    console.log('\n🏆 TOP 5 ENHANCED MATCHES:')
    newMatches.slice(0, 5).forEach((match, index) => {
      console.log(`${index + 1}. Score: ${match.score}% - ${match.matchReasons.join(', ')}`)
    })
    
    console.log('\n🎉 Match regeneration complete!')
    console.log(`📈 Total matches: ${newMatches.length}`)
    console.log(`🎯 High-quality matches (80%+): ${newMatches.filter(m => m.score >= 80).length}`)
    console.log(`⭐ Excellent matches (90%+): ${newMatches.filter(m => m.score >= 90).length}`)
    
  } catch (error) {
    console.error('❌ Error regenerating matches:', error)
    process.exit(1)
  }
}

// Run the script
regenerateMatches()
