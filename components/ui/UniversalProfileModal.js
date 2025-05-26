// Universal Profile Modal - AI-enhanced profiles for all entity types
// Addresses dead links and provides comprehensive entity profiles using OpenAI

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Modal from './Modal'
import { SkillLink, CompanyLink, AuthorityLink } from './LinkButton'

export default function UniversalProfileModal({ 
  isOpen, 
  onClose, 
  entity, 
  entityType,
  onNavigate = null
}) {
  const [aiProfile, setAiProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && entity) {
      generateAIProfile()
    }
  }, [isOpen, entity, entityType])

  const generateAIProfile = async () => {
    if (!entity) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/openai/generate-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity,
          entityType,
          context: 'profile_generation'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate profile: ${response.statusText}`)
      }

      const data = await response.json()
      setAiProfile(data.profile || 'Profile information not available.')
    } catch (err) {
      console.error('Error generating AI profile:', err)
      setError(err.message)
      setAiProfile(generateFallbackProfile())
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackProfile = () => {
    switch (entityType) {
      case 'company':
        return `${entity.name} is a ${entity.industry || 'technology'} company with approximately ${entity.employeeCount || 100} employees. The company focuses on innovation and growth in their sector.`
      
      case 'authority':
        return `${entity.name} is a ${entity.role || 'hiring manager'} with ${entity.hiringPower || 'medium'} hiring authority. They are responsible for talent acquisition and team building.`
      
      case 'jobSeeker':
        return `${entity.name} is a skilled professional with ${entity.experienceLevel || 'mid-level'} experience. They bring valuable expertise and are seeking new opportunities for growth.`
      
      case 'skill':
        return `${entity.name} is a valuable skill in the ${entity.category || 'technology'} domain. It is essential for various roles and projects in modern organizations.`
      
      case 'position':
        return `${entity.title || entity.name} is a ${entity.level || 'mid-level'} position requiring specific skills and experience. This role offers opportunities for professional development.`
      
      default:
        return 'Profile information is being generated...'
    }
  }

  const handleNavigateToMatches = () => {
    const entityId = entity._key || entity.id
    router.push(`/matches?${entityType}=${entityId}`)
    onClose()
  }

  const handleNavigateToNetwork = () => {
    const entityId = entity._key || entity.id
    router.push(`/global-view?focus=${entityType}&id=${entityId}`)
    onClose()
  }

  const handleNavigateToEntityPage = () => {
    const entityId = entity._key || entity.id
    const pageMap = {
      company: '/companies',
      authority: '/hiring-authorities',
      jobSeeker: '/job-seekers',
      skill: '/skills',
      position: '/positions'
    }
    
    const basePage = pageMap[entityType]
    if (basePage) {
      router.push(`${basePage}?highlight=${entityId}`)
      onClose()
    }
  }

  const getEntityIcon = () => {
    const iconMap = {
      company: '🏢',
      authority: '👔',
      jobSeeker: '👥',
      skill: '🛠️',
      position: '📋'
    }
    return iconMap[entityType] || '📄'
  }

  const getEntityColor = () => {
    const colorMap = {
      company: 'purple',
      authority: 'cyan',
      jobSeeker: 'orange',
      skill: 'green',
      position: 'red'
    }
    return colorMap[entityType] || 'gray'
  }

  const renderEntityDetails = () => {
    switch (entityType) {
      case 'company':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Industry:</span>
              <span className="ml-2 text-gray-900">{entity.industry || 'Technology'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Size:</span>
              <span className="ml-2 text-gray-900">{entity.employeeCount || 100} employees</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Open Positions:</span>
              <span className="ml-2 text-gray-900">{entity.openPositions || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hiring Authorities:</span>
              <span className="ml-2 text-gray-900">{entity.hiringAuthorities?.length || 0}</span>
            </div>
          </div>
        )
      
      case 'authority':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Role:</span>
              <span className="ml-2 text-gray-900">{entity.role || 'Hiring Manager'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Level:</span>
              <span className="ml-2 text-gray-900">{entity.level || 'Manager'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hiring Power:</span>
              <span className="ml-2 text-gray-900">{entity.hiringPower || 'Medium'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Decision Maker:</span>
              <span className="ml-2 text-gray-900">{entity.decisionMaker ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )
      
      case 'jobSeeker':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Experience:</span>
              <span className="ml-2 text-gray-900">{entity.experienceLevel || 'Mid-level'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-900">{entity.location || 'Remote'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Skills:</span>
              <span className="ml-2 text-gray-900">{entity.skills?.length || 0} skills</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Matches:</span>
              <span className="ml-2 text-gray-900">{entity.matches?.length || 0} potential</span>
            </div>
          </div>
        )
      
      case 'skill':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <span className="ml-2 text-gray-900">{entity.category || 'Technology'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Demand:</span>
              <span className="ml-2 text-gray-900">{entity.demand || 'High'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Job Seekers:</span>
              <span className="ml-2 text-gray-900">{entity.jobSeekerCount || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Open Positions:</span>
              <span className="ml-2 text-gray-900">{entity.positionCount || 0}</span>
            </div>
          </div>
        )
      
      case 'position':
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Level:</span>
              <span className="ml-2 text-gray-900">{entity.level || 'Mid-level'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <span className="ml-2 text-gray-900">{entity.department || 'Engineering'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Required Skills:</span>
              <span className="ml-2 text-gray-900">{entity.requiredSkills?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Candidates:</span>
              <span className="ml-2 text-gray-900">{entity.candidateCount || 0}</span>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (!entity) return null

  const entityColor = getEntityColor()
  const entityIcon = getEntityIcon()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Profile`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Entity Header */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${entityColor}-100 text-${entityColor}-600 text-2xl mb-4`}>
            {entityIcon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {entity.name || entity.title}
          </h2>
          {entity.role && (
            <p className="text-gray-600 mt-1">{entity.role}</p>
          )}
          {entity.company && (
            <p className="text-gray-500 text-sm mt-1">{entity.company}</p>
          )}
        </div>

        {/* Entity Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Details</h3>
          {renderEntityDetails()}
        </div>

        {/* AI-Generated Profile */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">AI-Enhanced Profile</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="text-gray-600">Generating profile...</span>
              </div>
            ) : error ? (
              <div className="text-red-600 text-sm">
                <p className="font-medium">Error generating profile:</p>
                <p>{error}</p>
                <p className="mt-2 text-gray-600">{generateFallbackProfile()}</p>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{aiProfile}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleNavigateToEntityPage}
            className={`btn-primary bg-${entityColor}-600 hover:bg-${entityColor}-700 flex-1`}
          >
            View Full Details
          </button>
          
          <button
            onClick={handleNavigateToNetwork}
            className="btn-outline flex-1"
          >
            🌐 Network View
          </button>
          
          <button
            onClick={handleNavigateToMatches}
            className="btn-outline flex-1"
          >
            🎯 Find Matches
          </button>
          
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
