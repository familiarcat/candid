import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Modal from './Modal'

export default function DetailModal({ 
  isOpen, 
  onClose, 
  entity, 
  entityType, 
  onFindTalent,
  onFindMatches 
}) {
  const [aiDescription, setAiDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && entity) {
      generateAIDescription()
    }
  }, [isOpen, entity])

  const generateAIDescription = async () => {
    if (!entity) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity,
          entityType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiDescription(data.description)
      } else {
        setAiDescription('Unable to generate description at this time.')
      }
    } catch (error) {
      console.error('Error generating AI description:', error)
      setAiDescription('Unable to generate description at this time.')
    } finally {
      setLoading(false)
    }
  }

  const handleFindTalent = () => {
    if (onFindTalent) {
      onFindTalent(entity)
    } else {
      // Default behavior - navigate to job seekers with skill filter
      const skillName = entity.name || entity.title
      router.push(`/job-seekers?skill=${encodeURIComponent(skillName)}`)
    }
    onClose()
  }

  const handleFindMatches = () => {
    if (onFindMatches) {
      onFindMatches(entity)
    } else {
      // Default behavior - navigate to matches with entity filter
      const entityId = entity._key || entity.id
      router.push(`/matches?${entityType}=${entityId}`)
    }
    onClose()
  }

  const renderEntitySpecificContent = () => {
    switch (entityType) {
      case 'skill':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{entity.category || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Market Demand</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  entity.demand === 'Very High' ? 'bg-red-100 text-red-800' :
                  entity.demand === 'High' ? 'bg-orange-100 text-orange-800' :
                  entity.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {entity.demand || 'Medium'}
                </span>
              </div>
            </div>
          </div>
        )
      
      case 'position':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Level</label>
                <p className="text-sm text-gray-900">{entity.level || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{entity.type || 'N/A'}</p>
              </div>
            </div>
            {entity.requirements && (
              <div>
                <label className="text-sm font-medium text-gray-700">Requirements</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entity.requirements.map((req, index) => (
                    <span key={index} className="badge badge-secondary text-xs">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      case 'company':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Industry</label>
                <p className="text-sm text-gray-900">{entity.industry || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Size</label>
                <p className="text-sm text-gray-900">{entity.employeeCount} employees</p>
              </div>
            </div>
            {entity.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{entity.description}</p>
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  if (!entity) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Details`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Entity Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800">
            {entity.name || entity.title}
          </h2>
          {entity.role && (
            <p className="text-candid-gray-600">{entity.role}</p>
          )}
        </div>

        {/* Entity-specific content */}
        {renderEntitySpecificContent()}

        {/* AI Description */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            AI Analysis
          </label>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4"></div>
              <span className="text-sm text-candid-gray-600">Generating intelligent analysis...</span>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 leading-relaxed">
                {aiDescription || 'No description available.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          {(entityType === 'skill' || entityType === 'position') && (
            <button
              onClick={handleFindTalent}
              className="btn-primary flex-1"
            >
              Find Talent
            </button>
          )}
          
          {entityType !== 'skill' && (
            <button
              onClick={handleFindMatches}
              className="btn-outline flex-1"
            >
              Find Matches
            </button>
          )}
          
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
