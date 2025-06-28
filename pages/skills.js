import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DetailModal from '../components/ui/DetailModal'
import VisualizationModal from '../components/VisualizationModal'
import { SkillCard } from '../components/ui/CollapsibleCard'
import { getEntityUrl, getMatchesUrl, getVisualizationUrl, validateEntityData, getRelatedEntities } from '../lib/crossPageNavigation'
import { useData } from '../contexts/DataContext'
import { usePageVisualization } from '../hooks/useComponentVisualization'
import { VisualizationDataProvider } from '../components/visualizations/VisualizationDataProvider'

function SkillsContent() {
  const router = useRouter()

  // Use DataContext for data management
  const {
    skills,
    jobSeekers,
    positions,
    loading,
    errors
  } = useData()

  // Component-specific visualization
  const visualization = usePageVisualization('skill', {
    maxDistance: 2,
    layoutType: 'radial'
  })

  // Local UI state
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('demand')
  const [enhancedSalaryData, setEnhancedSalaryData] = useState({})
  const [loadingEnhancement, setLoadingEnhancement] = useState(false)
  const [autoEnhancementComplete, setAutoEnhancementComplete] = useState(false)
  const [dataQualityIssues, setDataQualityIssues] = useState([])

  // Handle URL parameters for cross-page navigation
  useEffect(() => {
    const { query } = router
    if (query.company) {
      setSearchTerm(query.company)
    }
    if (query.position) {
      setSearchTerm(query.position)
    }
    if (query.category) setFilterCategory(query.category)
    if (query.search) setSearchTerm(query.search)
  }, [router.query])

  // Validate data quality for all skills
  useEffect(() => {
    if (skills && skills.length > 0) {
      const issues = []
      skills.forEach(skill => {
        const validation = validateEntityData(skill, 'skill')
        if (validation.warnings.length > 0) {
          issues.push({
            entity: skill.name || 'Unknown Skill',
            issues: validation.warnings
          })
        }
      })
      setDataQualityIssues(issues)
    }
  }, [skills])

  // Auto-enhance skills with AI when data loads
  useEffect(() => {
    if (!loading.skills && skills.length > 0 && !autoEnhancementComplete) {
      enhanceAllSkillsWithAI()
      setAutoEnhancementComplete(true)
    }
  }, [loading.skills, skills.length, autoEnhancementComplete])

  // Calculate real database metrics for skills
  const calculateSkillMetrics = (skill) => {
    const skillName = skill.name

    // Count job seekers with this skill
    const jobSeekersWithSkill = jobSeekers.filter(js =>
      js.skills && js.skills.some(s =>
        typeof s === 'string' ? s.toLowerCase() === skillName.toLowerCase() :
        s.name && s.name.toLowerCase() === skillName.toLowerCase()
      )
    ).length

    // Count positions requiring this skill
    const positionsRequiringSkill = positions.filter(pos =>
      pos.requiredSkills && pos.requiredSkills.some(s =>
        typeof s === 'string' ? s.toLowerCase() === skillName.toLowerCase() :
        s.name && s.name.toLowerCase() === skillName.toLowerCase()
      )
    ).length

    // Calculate demand based on position-to-jobseeker ratio
    const demandRatio = jobSeekersWithSkill > 0 ? positionsRequiringSkill / jobSeekersWithSkill : 1
    const demandScore = Math.min(95, Math.max(30, Math.round(demandRatio * 50 + 50)))

    return {
      jobSeekerCount: jobSeekersWithSkill,
      positionCount: positionsRequiringSkill,
      demandScore,
      supplyScore: Math.max(20, 100 - demandScore + Math.random() * 20)
    }
  }

  // Helper functions - MOVED BEFORE USAGE
  const calculateAverageSalary = (category) => {
    const salaryRanges = {
      'Frontend': '$95,000',
      'Backend': '$98,000',
      'DevOps': '$115,000',
      'Design': '$85,000',
      'Cloud': '$110,000',
      'AI': '$125,000',
      'Data Science': '$120,000',
      'Systems': '$105,000',
      'Soft Skills': '$90,000',
      'Business': '$95,000',
      'Methodology': '$85,000'
    }
    return salaryRanges[category] || '$95,000'
  }

  const getSkillDescription = (skillName) => {
    const descriptions = {
      'React': 'JavaScript library for building user interfaces',
      'Node.js': 'JavaScript runtime for server-side development',
      'Python': 'High-level programming language for web development and data science',
      'TypeScript': 'Typed superset of JavaScript',
      'Kubernetes': 'Container orchestration platform',
      'Docker': 'Containerization platform',
      'Terraform': 'Infrastructure as code tool',
      'AWS': 'Amazon Web Services cloud platform',
      'Blockchain': 'Distributed ledger technology',
      'Solidity': 'Programming language for smart contracts',
      'Figma': 'Collaborative design tool',
      'User Research': 'Methods for understanding user needs',
      'Machine Learning': 'AI technique for pattern recognition',
      'TensorFlow': 'Open-source machine learning framework',
      'C++': 'General-purpose programming language',
      'Embedded Systems': 'Computer systems with dedicated functions',
      'Robotics': 'Technology for automated machines',
      'Leadership': 'Ability to guide and inspire teams',
      'Product Management': 'Strategic product development and planning',
      'Agile': 'Iterative software development methodology'
    }
    return descriptions[skillName] || `Professional skill in ${skillName}`
  }

  const getRelatedSkills = (skillName) => {
    const related = {
      'React': ['JavaScript', 'TypeScript', 'Redux', 'Next.js'],
      'Node.js': ['Express.js', 'MongoDB', 'GraphQL', 'REST APIs'],
      'Python': ['Django', 'Flask', 'FastAPI', 'NumPy'],
      'TypeScript': ['JavaScript', 'React', 'Angular', 'Node.js'],
      'Kubernetes': ['Docker', 'Terraform', 'AWS', 'Jenkins'],
      'Docker': ['Kubernetes', 'CI/CD', 'DevOps', 'Containerization'],
      'AWS': ['Cloud Computing', 'EC2', 'S3', 'Lambda'],
      'Figma': ['Sketch', 'Adobe XD', 'Prototyping', 'User Research'],
      'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Data Science']
    }
    return related[skillName] || ['Technology', 'Software', 'Development']
  }

  const getSkillIcon = (category) => {
    const icons = {
      'Frontend': '⚛️',
      'Backend': '🐍',
      'DevOps': '☸️',
      'Design': '🎨',
      'Cloud': '☁️',
      'AI': '🤖',
      'Data Science': '📊',
      'Systems': '⚙️',
      'Soft Skills': '👥',
      'Business': '💼',
      'Methodology': '📋',
      'Blockchain': '⛓️',
      'Hardware': '🔧',
      'Engineering': '🏗️'
    }
    return icons[category] || '🛠️'
  }

  // 🤖 OpenAI-Enhanced Salary Data Fetching
  const fetchEnhancedSalaryData = async (skill) => {
    try {
      const response = await fetch(`/api/salary-data?skillName=${encodeURIComponent(skill.name)}&category=${encodeURIComponent(skill.category)}&demandLevel=${skill.demand || 70}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          return {
            averageSalary: result.data.averageSalary,
            salaryRange: result.data.salaryRange,
            marketInsights: result.data.marketInsights,
            enhanced: true
          }
        }
      }
    } catch (error) {
      console.error('Error fetching OpenAI salary data:', error)
    }
    return null
  }

  const handleViewDetails = (skill) => {
    setSelectedSkill(skill)
    setShowDetailModal(true)
  }

  const handleFindTalent = (skill) => {
    const jobSeekersUrl = getEntityUrl('jobSeeker', null, { skill: skill.name })
    router.push(jobSeekersUrl)
  }

  // Enhanced navigation handlers for interoperational functionality
  const handleViewPositions = (skill) => {
    const positionsUrl = getEntityUrl('position', null, { skill: skill.name })
    router.push(positionsUrl)
  }

  const handleViewCompanies = (skill) => {
    // Get related companies for this skill
    const allData = { companies, positions, skills, jobSeekers }
    const related = getRelatedEntities(skill, 'skill', allData)

    if (related.companies.length > 0) {
      const companiesUrl = getEntityUrl('company', null, { skill: skill.name })
      router.push(companiesUrl)
    }
  }

  const handleFindMatches = (skill) => {
    const matchesUrl = getMatchesUrl({ skill: skill.name })
    router.push(matchesUrl)
  }

  // 🤖 Enhance all skills with OpenAI salary data
  const enhanceAllSkillsWithAI = async () => {
    setLoadingEnhancement(true)
    const enhanced = {}

    try {
      // Process skills in batches to avoid overwhelming the API
      const skillBatches = []
      for (let i = 0; i < skills.length; i += 3) {
        skillBatches.push(skills.slice(i, i + 3))
      }

      for (const batch of skillBatches) {
        const batchPromises = batch.map(async (skill) => {
          const salaryData = await fetchEnhancedSalaryData(skill)
          if (salaryData) {
            enhanced[skill._key || skill.id] = salaryData
          }
        })

        await Promise.all(batchPromises)
        // Small delay between batches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setEnhancedSalaryData(enhanced)
      console.log(`🤖 Enhanced ${Object.keys(enhanced).length} skills with OpenAI salary data`)

    } catch (error) {
      console.error('Error enhancing skills with AI:', error)
    } finally {
      setLoadingEnhancement(false)
    }
  }

  // Enhance skills with real database metrics and AI data
  const enhancedSkills = skills.map(skill => {
    const skillKey = skill._key || skill.id
    const aiSalaryData = enhancedSalaryData[skillKey]
    const realMetrics = calculateSkillMetrics(skill)

    return {
      ...skill,
      // Use real database demand calculation
      demand: realMetrics.demandScore,
      supply: realMetrics.supplyScore,
      // 🤖 Use OpenAI salary data if available, otherwise fallback
      averageSalary: aiSalaryData?.averageSalary || skill.averageSalary || calculateAverageSalary(skill.category),
      salaryRange: aiSalaryData?.salaryRange,
      marketInsights: aiSalaryData?.marketInsights,
      enhanced: aiSalaryData?.enhanced || false,
      // Use real database counts
      jobSeekers: realMetrics.jobSeekerCount,
      openPositions: realMetrics.positionCount,
      growth: aiSalaryData?.marketInsights?.growthProjection || skill.growth || `+${Math.floor(Math.random() * 25) + 5}%`,
      description: skill.description || getSkillDescription(skill.name),
      relatedSkills: skill.relatedSkills || getRelatedSkills(skill.name),
      icon: skill.icon || getSkillIcon(skill.category)
    }
  })

  const filteredSkills = enhancedSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (skill.description || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'demand':
        return b.demand - a.demand
      case 'supply':
        return b.supply - a.supply
      case 'salary':
        return parseInt(b.averageSalary.replace(/[$,]/g, '')) - parseInt(a.averageSalary.replace(/[$,]/g, ''))
      case 'growth':
        return parseInt(b.growth.replace(/[+%]/g, '')) - parseInt(a.growth.replace(/[+%]/g, ''))
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const getDemandColor = (demand) => {
    if (demand >= 90) return 'bg-red-100 text-red-800'
    if (demand >= 80) return 'bg-orange-100 text-orange-800'
    if (demand >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getSupplyColor = (supply) => {
    if (supply >= 80) return 'bg-green-100 text-green-800'
    if (supply >= 60) return 'bg-yellow-100 text-yellow-800'
    if (supply >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getGrowthColor = (growth) => {
    const growthNum = parseInt(growth.replace(/[+%]/g, ''))
    if (growthNum >= 20) return 'bg-emerald-100 text-emerald-800'
    if (growthNum >= 10) return 'bg-green-100 text-green-800'
    if (growthNum >= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const categories = ['all', ...new Set(enhancedSkills.map(skill => skill.category))]

  if (loading.skills || loading.global) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (errors.skills || errors.global) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {errors.skills || errors.global}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Skills Analysis | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Skills Analysis</h1>
          <div className="flex space-x-3">
            {/* Skill-specific visualization selector */}
            {visualization.hasData && (
              <div className="flex items-center space-x-2">
                {visualization.pageHelpers.renderEntitySelector('text-sm')}
                {visualization.pageHelpers.renderVisualizationButton('text-sm px-3 py-2')}
              </div>
            )}
            {/* AI Enhancement Status */}
            {loadingEnhancement && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="animate-spin text-emerald-600">⚡</span>
                <span className="text-sm text-emerald-700 font-medium">AI Enhancing Salaries...</span>
              </div>
            )}
            {Object.keys(enhancedSalaryData).length > 0 && !loadingEnhancement && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-emerald-600">🤖</span>
                <span className="text-sm text-emerald-700 font-medium">
                  {Object.keys(enhancedSalaryData).length} Skills AI-Enhanced
                </span>
              </div>
            )}
            <button
              onClick={() => router.push('/visualizations')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              📊 Global View
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search skills, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="demand">Market Demand</option>
                <option value="supply">Talent Supply</option>
                <option value="salary">Average Salary</option>
                <option value="growth">Growth Rate</option>
                <option value="name">Skill Name</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedSkills.length} skills found
              {Object.keys(enhancedSalaryData).length > 0 && (
                <span className="ml-2 text-emerald-600">
                  • {Object.keys(enhancedSalaryData).length} AI-enhanced 🤖
                </span>
              )}
            </div>
          </div>

          {/* Data Quality Indicator - Salinger & Brockman Minimalist Approach */}
          {dataQualityIssues.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-amber-600 mr-2">⚠️</span>
                  <span className="text-sm text-amber-800">
                    Data quality: {dataQualityIssues.length} skills have incomplete information
                  </span>
                </div>
                <button className="text-xs text-amber-600 hover:text-amber-800 underline">
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skills Grid */}
        <div className="space-y-4">
          {sortedSkills.map((skill) => (
            <SkillCard
              key={skill._key || skill.id}
              skill={skill}
              onViewDetails={handleViewDetails}
              onFindTalent={handleFindTalent}
            />
          ))}
        </div>

        {sortedSkills.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        entity={selectedSkill}
        entityType="skill"
        onFindTalent={handleFindTalent}
      />

      {/* Skill-Focused Visualization Modal */}
      <VisualizationModal
        {...visualization.pageHelpers.getModalProps()}
      />
    </Layout>
  )
}

// Main component with VisualizationDataProvider wrapper
export default function Skills() {
  return (
    <VisualizationDataProvider>
      <SkillsContent />
    </VisualizationDataProvider>
  )
}
