// OpenAI-powered salary data generation service
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate realistic salary data using OpenAI
 * @param {Object} params - Parameters for salary generation
 * @param {string} params.skillName - Name of the skill
 * @param {string} params.category - Skill category (Frontend, Backend, etc.)
 * @param {string} params.location - Geographic location (optional)
 * @param {string} params.experienceLevel - Experience level (Junior, Mid, Senior)
 * @param {number} params.demandLevel - Market demand level (1-100)
 * @returns {Promise<Object>} Salary data with ranges and insights
 */
export async function generateRealisticSalaryData({
  skillName,
  category,
  location = 'United States',
  experienceLevel = 'Mid',
  demandLevel = 70
}) {
  try {
    const prompt = `As a salary data expert, provide realistic 2024 salary information for the skill "${skillName}" in the ${category} category.

Context:
- Location: ${location}
- Experience Level: ${experienceLevel}
- Market Demand: ${demandLevel}/100
- Current Date: ${new Date().toISOString().split('T')[0]}

Please provide a JSON response with the following structure:
{
  "averageSalary": "$XXX,XXX",
  "salaryRange": {
    "min": "$XX,XXX",
    "max": "$XXX,XXX"
  },
  "experienceLevels": {
    "junior": "$XX,XXX - $XX,XXX",
    "mid": "$XX,XXX - $XXX,XXX", 
    "senior": "$XXX,XXX - $XXX,XXX"
  },
  "marketInsights": {
    "demandTrend": "High/Medium/Low",
    "growthProjection": "+X% annually",
    "keyFactors": ["factor1", "factor2", "factor3"]
  },
  "locationAdjustment": {
    "nationalAverage": "$XXX,XXX",
    "locationMultiplier": 1.2,
    "topPayingCities": ["City1", "City2", "City3"]
  }
}

Base your response on current market data, considering:
- Remote work impact on salaries
- Tech industry trends
- Supply and demand for this specific skill
- Geographic cost of living adjustments
- Recent salary surveys and reports

Provide realistic, current market rates. Do not inflate numbers.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional salary data analyst with access to current market data. Provide accurate, realistic salary information based on 2024 market conditions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 1000
    })

    const response = completion.choices[0].message.content
    
    // Parse the JSON response
    const salaryData = JSON.parse(response)
    
    // Add metadata
    salaryData.metadata = {
      generatedAt: new Date().toISOString(),
      source: 'OpenAI GPT-4',
      skillName,
      category,
      location,
      experienceLevel,
      demandLevel
    }

    return salaryData

  } catch (error) {
    console.error('Error generating salary data:', error)
    
    // Fallback to static data if OpenAI fails
    return generateFallbackSalaryData({ skillName, category, experienceLevel, demandLevel })
  }
}

/**
 * Fallback salary data when OpenAI is unavailable
 */
function generateFallbackSalaryData({ skillName, category, experienceLevel, demandLevel }) {
  const baseSalaries = {
    'Frontend': { junior: 75000, mid: 95000, senior: 125000 },
    'Backend': { junior: 80000, mid: 100000, senior: 130000 },
    'DevOps': { junior: 85000, mid: 110000, senior: 140000 },
    'Design': { junior: 65000, mid: 85000, senior: 115000 },
    'Cloud': { junior: 90000, mid: 115000, senior: 145000 },
    'AI': { junior: 95000, mid: 125000, senior: 160000 },
    'Data Science': { junior: 90000, mid: 120000, senior: 155000 },
    'Systems': { junior: 85000, mid: 105000, senior: 135000 },
    'Soft Skills': { junior: 70000, mid: 90000, senior: 120000 },
    'Business': { junior: 75000, mid: 95000, senior: 125000 },
    'Methodology': { junior: 70000, mid: 85000, senior: 110000 }
  }

  const categoryData = baseSalaries[category] || baseSalaries['Frontend']
  const demandMultiplier = 0.8 + (demandLevel / 100) * 0.4 // 0.8 to 1.2 multiplier
  
  const adjustedSalaries = {
    junior: Math.round(categoryData.junior * demandMultiplier),
    mid: Math.round(categoryData.mid * demandMultiplier),
    senior: Math.round(categoryData.senior * demandMultiplier)
  }

  const currentSalary = adjustedSalaries[experienceLevel.toLowerCase()] || adjustedSalaries.mid

  return {
    averageSalary: `$${currentSalary.toLocaleString()}`,
    salaryRange: {
      min: `$${Math.round(currentSalary * 0.85).toLocaleString()}`,
      max: `$${Math.round(currentSalary * 1.15).toLocaleString()}`
    },
    experienceLevels: {
      junior: `$${Math.round(adjustedSalaries.junior * 0.9).toLocaleString()} - $${Math.round(adjustedSalaries.junior * 1.1).toLocaleString()}`,
      mid: `$${Math.round(adjustedSalaries.mid * 0.9).toLocaleString()} - $${Math.round(adjustedSalaries.mid * 1.1).toLocaleString()}`,
      senior: `$${Math.round(adjustedSalaries.senior * 0.9).toLocaleString()} - $${Math.round(adjustedSalaries.senior * 1.1).toLocaleString()}`
    },
    marketInsights: {
      demandTrend: demandLevel >= 80 ? 'High' : demandLevel >= 60 ? 'Medium' : 'Low',
      growthProjection: `+${Math.round(demandLevel / 10)}% annually`,
      keyFactors: ['Market demand', 'Remote work trends', 'Industry growth']
    },
    locationAdjustment: {
      nationalAverage: `$${currentSalary.toLocaleString()}`,
      locationMultiplier: 1.0,
      topPayingCities: ['San Francisco', 'New York', 'Seattle']
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'Fallback calculation',
      skillName,
      category,
      experienceLevel,
      demandLevel
    }
  }
}

/**
 * Batch generate salary data for multiple skills
 */
export async function generateBatchSalaryData(skills, options = {}) {
  const results = []
  
  for (const skill of skills) {
    try {
      const salaryData = await generateRealisticSalaryData({
        skillName: skill.name,
        category: skill.category,
        location: options.location,
        experienceLevel: options.experienceLevel || 'Mid',
        demandLevel: skill.demand || 70
      })
      
      results.push({
        skillId: skill._key || skill.id,
        skillName: skill.name,
        salaryData
      })
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`Error generating salary for ${skill.name}:`, error)
      results.push({
        skillId: skill._key || skill.id,
        skillName: skill.name,
        error: error.message
      })
    }
  }
  
  return results
}

/**
 * Cache salary data to avoid repeated API calls
 */
const salaryCache = new Map()

export async function getCachedSalaryData(skillName, category, options = {}) {
  const cacheKey = `${skillName}-${category}-${options.location || 'US'}-${options.experienceLevel || 'Mid'}`
  
  if (salaryCache.has(cacheKey)) {
    const cached = salaryCache.get(cacheKey)
    // Cache for 24 hours
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data
    }
  }
  
  const salaryData = await generateRealisticSalaryData({
    skillName,
    category,
    ...options
  })
  
  salaryCache.set(cacheKey, {
    data: salaryData,
    timestamp: Date.now()
  })
  
  return salaryData
}
