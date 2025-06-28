import { useState } from 'react'

export default function CollapsibleCard({
  title,
  subtitle,
  icon,
  primaryMetrics,
  expandedContent,
  actions,
  variant = 'default',
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const variants = {
    default: 'border-gray-200 hover:border-gray-300',
    skill: 'border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-white',
    company: 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-white',
    authority: 'border-cyan-200 hover:border-cyan-300 bg-gradient-to-br from-cyan-50 to-white',
    position: 'border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-white'
  }

  return (
    <div className={`card ${variants[variant]} transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'} ${className}`}>
      {/* Collapsed Header - Compact */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {icon && (
              <div className="text-lg">{icon}</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Primary Metrics - Always Visible */}
          <div className="flex items-center space-x-3 mr-2">
            {primaryMetrics}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white bg-opacity-50">
          <div className="p-4 space-y-4">
            {expandedContent}

            {/* Actions */}
            {actions && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized collapsible cards for different entity types
export function SkillCard({ skill, onViewDetails, onFindTalent }) {
  const primaryMetrics = (
    <>
      <div className="text-center">
        <div className="text-sm font-bold text-blue-600">{skill.demand === 'Very High' ? '95%' : skill.demand === 'High' ? '85%' : '70%'}</div>
        <div className="text-xs text-gray-500">Demand</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-green-600">{skill.supply || Math.floor(Math.random() * 40) + 60}%</div>
        <div className="text-xs text-gray-500">Supply</div>
      </div>
    </>
  )

  const expandedContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <p className="text-sm text-gray-900">{skill.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Average Salary</label>
          <p className="text-sm text-gray-900">{skill.averageSalary || '$95,000'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Job Seekers</label>
          <p className="text-sm text-gray-900">{skill.jobSeekers || Math.floor(Math.random() * 100) + 50}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Open Positions</label>
          <p className="text-sm text-gray-900">{skill.openPositions || Math.floor(Math.random() * 50) + 20}</p>
        </div>
      </div>

      {skill.description && (
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <p className="text-sm text-gray-900">{skill.description}</p>
        </div>
      )}

      {skill.relatedSkills && skill.relatedSkills.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Related Skills</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {skill.relatedSkills.map((relatedSkill, index) => (
              <span key={index} className="badge badge-secondary text-xs">
                {relatedSkill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const actions = [
    <button
      key="details"
      onClick={() => onViewDetails(skill)}
      className="btn-primary text-sm px-4 py-2"
    >
      View Details
    </button>,
    <button
      key="talent"
      onClick={() => onFindTalent(skill)}
      className="btn-outline text-sm px-4 py-2"
    >
      Find Talent
    </button>
  ]

  return (
    <CollapsibleCard
      title={skill.name}
      subtitle={skill.category}
      icon={skill.icon || '🛠️'}
      primaryMetrics={primaryMetrics}
      expandedContent={expandedContent}
      actions={actions}
      variant="skill"
    />
  )
}

// Removed duplicate CompanyCard - using the enhanced version below

// Position Card Component
export function PositionCard({ position, onViewDetails, onFindMatches, onNetworkView }) {
  const getColorClass = (color) => {
    const colorMap = {
      purple: 'text-purple-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      emerald: 'text-emerald-600',
      gray: 'text-gray-600',
      red: 'text-red-600'
    }
    return colorMap[color] || 'text-gray-600'
  }

  const primaryMetrics = (
    <>
      <div className="text-center">
        <div className={`text-sm font-bold ${getColorClass(position.level === 'Senior' ? 'purple' : position.level === 'Junior' ? 'green' : 'blue')}`}>
          {position.level || 'Mid'}
        </div>
        <div className="text-xs text-gray-500">Level</div>
      </div>
      <div className="text-center">
        <div className={`text-sm font-bold ${getColorClass(position.type === 'Contract' ? 'orange' : position.type === 'Part-time' ? 'yellow' : 'emerald')}`}>
          {position.type || 'Full-time'}
        </div>
        <div className="text-xs text-gray-500">Type</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-gray-600">{position.applicants || 0}</div>
        <div className="text-xs text-gray-500">Applicants</div>
      </div>
      <div className="text-center">
        <div className={`text-sm font-bold ${getColorClass(position.status === 'active' ? 'green' : position.status === 'paused' ? 'yellow' : 'red')}`}>
          {position.status || 'active'}
        </div>
        <div className="text-xs text-gray-500">Status</div>
      </div>
    </>
  )

  const expandedContent = (
    <div className="space-y-4">
      {/* Position Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">Company</label>
          <p className="text-sm text-gray-900">{position.company}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <p className="text-sm text-gray-900">
            {position.location} {position.remote && '(Remote OK)'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Salary</label>
          <p className="text-sm text-gray-900">{position.salary || 'Competitive'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Posted</label>
          <p className="text-sm text-gray-900">
            {position.postedDate ? new Date(position.postedDate).toLocaleDateString() : 'Recently'}
          </p>
        </div>
      </div>

      {/* Description */}
      {position.description && (
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <p className="text-sm text-gray-900 leading-relaxed">{position.description}</p>
        </div>
      )}

      {/* Required Skills */}
      {position.requirements && position.requirements.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Required Skills</label>
          <div className="flex flex-wrap gap-1">
            {position.requirements.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      {position.benefits && position.benefits.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Benefits</label>
          <div className="flex flex-wrap gap-1">
            {position.benefits.map((benefit, index) => (
              <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {position.department && (
          <div>
            <label className="text-sm font-medium text-gray-700">Department</label>
            <p className="text-sm text-gray-900">{position.department}</p>
          </div>
        )}
        {position.experienceRequired && (
          <div>
            <label className="text-sm font-medium text-gray-700">Experience Required</label>
            <p className="text-sm text-gray-900">{position.experienceRequired}</p>
          </div>
        )}
      </div>
    </div>
  )

  const actions = [
    <button
      key="details"
      onClick={() => onViewDetails(position)}
      className="btn-primary text-sm px-4 py-2 flex-1"
    >
      View Details
    </button>,
    <button
      key="network"
      onClick={() => onNetworkView(position)}
      className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
    >
      🌐 Network
    </button>,
    <button
      key="matches"
      onClick={() => onFindMatches(position)}
      className="btn-outline text-sm px-3 py-2"
    >
      Find Matches
    </button>
  ]

  return (
    <CollapsibleCard
      title={position.title}
      subtitle={`${position.company} • ${position.location}`}
      icon="📋"
      primaryMetrics={primaryMetrics}
      expandedContent={expandedContent}
      actions={actions}
      variant="position"
    />
  )
}

// Company Card Component
export function CompanyCard({ company, onViewDetails, onFindMatches, onNetworkView }) {
  const getColorClass = (color) => {
    const colorMap = {
      purple: 'text-purple-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      emerald: 'text-emerald-600',
      gray: 'text-gray-600',
      red: 'text-red-600'
    }
    return colorMap[color] || 'text-gray-600'
  }

  const primaryMetrics = (
    <>
      <div className="text-center">
        <div className="text-sm font-bold text-blue-600">
          {company.industry || 'Technology'}
        </div>
        <div className="text-xs text-gray-500">Industry</div>
      </div>
      <div className="text-center">
        <div className={`text-sm font-bold ${getColorClass(company.size === 'Large' ? 'purple' : company.size === 'Medium' ? 'blue' : 'green')}`}>
          {company.size || `${company.employeeCount || 100} employees`}
        </div>
        <div className="text-xs text-gray-500">Size</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-emerald-600">{company.openPositions || 0}</div>
        <div className="text-xs text-gray-500">Open Positions</div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-orange-600">{company.authorityCount || 0}</div>
        <div className="text-xs text-gray-500">Authorities</div>
      </div>
    </>
  )

  const expandedContent = (
    <div className="space-y-4">
      {/* Company Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <p className="text-sm text-gray-900">{company.location || 'Location not specified'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Founded</label>
          <p className="text-sm text-gray-900">{company.founded || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Employee Count</label>
          <p className="text-sm text-gray-900">{company.employeeCount || 'Not specified'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Potential Matches</label>
          <p className="text-sm text-gray-900">{company.potentialMatches || 0} candidates</p>
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <p className="text-sm text-gray-900 leading-relaxed">{company.description}</p>
        </div>
      )}

      {/* Website */}
      {company.website && (
        <div>
          <label className="text-sm font-medium text-gray-700">Website</label>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {company.website} →
          </a>
        </div>
      )}

      {/* Key Contacts */}
      {Array.isArray(company.hiringAuthorities) && company.hiringAuthorities.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Key Contacts</label>
          <div className="space-y-2">
            {company.hiringAuthorities.slice(0, 3).map((authority, index) => {
              // Defensive programming - ensure authority is an object
              if (!authority || typeof authority !== 'object') {
                return null
              }

              return (
                <div key={authority.id || authority._key || index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">👤</span>
                    <span className="font-medium">{authority.name || 'Unknown'}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600">{authority.role || authority.level || 'Staff'}</span>
                  </div>
                </div>
              )
            }).filter(Boolean)}
            {company.hiringAuthorities.length > 3 && (
              <p className="text-xs text-gray-500">
                +{company.hiringAuthorities.length - 3} more contacts
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const actions = [
    <button
      key="details"
      onClick={() => onViewDetails(company)}
      className="btn-primary text-sm px-4 py-2 flex-1"
    >
      View Details
    </button>,
    <button
      key="network"
      onClick={() => onNetworkView(company)}
      className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
    >
      🌐 Network
    </button>,
    <button
      key="matches"
      onClick={() => onFindMatches(company)}
      className="btn-outline text-sm px-3 py-2"
    >
      Find Matches
    </button>
  ]

  return (
    <CollapsibleCard
      title={company.name}
      subtitle={`${company.industry || 'Technology'} • ${company.location || 'Global'}`}
      icon="🏢"
      primaryMetrics={primaryMetrics}
      expandedContent={expandedContent}
      actions={actions}
      variant="company"
    />
  )
}
