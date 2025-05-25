import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DetailModal from '../components/ui/DetailModal'
import { SkillCard } from '../components/ui/CollapsibleCard'

export default function Skills() {
  const router = useRouter()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('demand')

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skills?includeStats=true')
        if (response.ok) {
          const data = await response.json()
          const skillsData = data.skills || data

          // Use real database calculations with enhanced metrics
          const enhancedSkills = skillsData.map(skill => ({
            ...skill,
            // Use real demand calculation from API, with fallback
            demand: skill.demand || calculateDemandLevel(skill.openPositions, skill.jobSeekers),
            supply: skill.supply || skill.jobSeekers || 0,
            averageSalary: calculateAverageSalary(skill.category),
            jobSeekers: skill.jobSeekers || 0,
            openPositions: skill.openPositions || 0,
            growth: skill.growth || calculateGrowthRate(skill.openPositions, skill.jobSeekers),
            description: getSkillDescription(skill.name),
            relatedSkills: getRelatedSkills(skill.name),
            icon: getSkillIcon(skill.category)
          }))

          setSkills(enhancedSkills)
        } else {
          // No fallback data - ensure database is seeded
          console.warn('No skills data found - database may need seeding')
          setSkills([])
        }
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchSkills()
  }, [])

  // Helper functions
  const calculateDemandLevel = (openPositions, jobSeekers) => {
    if (!openPositions || !jobSeekers) return 50
    const ratio = openPositions / Math.max(jobSeekers, 1)
    if (ratio >= 0.8) return 95  // Very High demand
    if (ratio >= 0.5) return 85  // High demand
    if (ratio >= 0.3) return 70  // Medium demand
    return 60  // Low demand
  }

  const calculateGrowthRate = (openPositions, jobSeekers) => {
    if (!openPositions || !jobSeekers) return '+5%'
    const ratio = openPositions / Math.max(jobSeekers, 1)
    if (ratio >= 0.8) return '+25%'  // High growth for high demand
    if (ratio >= 0.5) return '+15%'  // Medium-high growth
    if (ratio >= 0.3) return '+8%'   // Medium growth
    return '+3%'  // Low growth
  }

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

  const handleViewDetails = (skill) => {
    setSelectedSkill(skill)
    setShowDetailModal(true)
  }

  const handleFindTalent = (skill) => {
    router.push(`/job-seekers?skill=${encodeURIComponent(skill.name)}`)
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase())

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

  const categories = ['all', ...new Set(skills.map(skill => skill.category))]

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
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
          <button
            onClick={() => router.push('/visualizations')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            📊 Visualize
          </button>
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
            </div>
          </div>
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
    </Layout>
  )
}
