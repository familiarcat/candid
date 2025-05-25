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
      {/* Collapsed Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {icon && (
              <div className="text-2xl">{icon}</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Primary Metrics - Always Visible */}
          <div className="flex items-center space-x-4 mr-4">
            {primaryMetrics}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="text-lg font-bold text-blue-600">{skill.demand === 'Very High' ? '95%' : skill.demand === 'High' ? '85%' : '70%'}</div>
        <div className="text-xs text-gray-500">Demand</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{skill.supply || Math.floor(Math.random() * 40) + 60}%</div>
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

export function CompanyCard({ company, onViewDetails }) {
  const primaryMetrics = (
    <>
      <div className="text-center">
        <div className="text-lg font-bold text-purple-600">{company.employeeCount}</div>
        <div className="text-xs text-gray-500">Employees</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-orange-600">{company.openPositions || Math.floor(Math.random() * 20) + 5}</div>
        <div className="text-xs text-gray-500">Open Roles</div>
      </div>
    </>
  )

  const expandedContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Industry</label>
          <p className="text-sm text-gray-900">{company.industry}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Founded</label>
          <p className="text-sm text-gray-900">{company.founded || 'N/A'}</p>
        </div>
      </div>
      
      {company.description && (
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <p className="text-sm text-gray-900">{company.description}</p>
        </div>
      )}

      {company.website && (
        <div>
          <label className="text-sm font-medium text-gray-700">Website</label>
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700">
            {company.website}
          </a>
        </div>
      )}
    </div>
  )

  const actions = [
    <button
      key="details"
      onClick={() => onViewDetails(company)}
      className="btn-primary text-sm px-4 py-2"
    >
      View Details
    </button>
  ]

  return (
    <CollapsibleCard
      title={company.name}
      subtitle={`${company.industry} • ${company.size}`}
      icon="🏢"
      primaryMetrics={primaryMetrics}
      expandedContent={expandedContent}
      actions={actions}
      variant="company"
    />
  )
}
