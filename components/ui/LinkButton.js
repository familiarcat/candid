import Link from 'next/link'
import { useState } from 'react'

// Reusable link button component with consistent styling and hover effects
export default function LinkButton({ 
  href, 
  children, 
  variant = 'primary', 
  size = 'sm',
  showPreview = false,
  previewContent = null,
  className = '',
  onClick,
  external = false
}) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 focus:ring-gray-500 shadow-sm hover:shadow-md',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500 shadow-sm hover:shadow-md',
    skill: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 focus:ring-blue-500',
    company: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 focus:ring-purple-500',
    authority: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 hover:border-cyan-300 focus:ring-cyan-500',
    position: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-300 focus:ring-orange-500',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm hover:shadow-md'
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
    if (showPreview && previewContent) {
      e.preventDefault()
      setShowPreviewModal(true)
    }
  }

  const content = (
    <span className="flex items-center space-x-1">
      {children}
      {external && (
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
      {showPreview && (
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </span>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={handleClick}
      >
        {content}
      </a>
    )
  }

  if (onClick || showPreview) {
    return (
      <>
        <button className={classes} onClick={handleClick}>
          {content}
        </button>
        
        {/* Preview Modal */}
        {showPreviewModal && previewContent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPreviewModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Preview</h3>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {previewContent}
                  <div className="mt-4 flex space-x-2">
                    <Link href={href} className="btn-primary flex-1 text-center">
                      View Full Details
                    </Link>
                    <button 
                      onClick={() => setShowPreviewModal(false)}
                      className="btn-outline flex-1"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <Link href={href} className={classes} onClick={handleClick}>
      {content}
    </Link>
  )
}

// Specialized link buttons for different entity types
export function SkillLink({ skill, children, ...props }) {
  return (
    <LinkButton
      href={`/skills?highlight=${skill._key || skill.id}`}
      variant="skill"
      previewContent={
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{skill.description || `Professional skill in ${skill.name}`}</p>
          <div className="flex justify-between text-xs">
            <span>Category: <strong>{skill.category}</strong></span>
            <span>Demand: <strong>{skill.demand}</strong></span>
          </div>
        </div>
      }
      showPreview={true}
      {...props}
    >
      {children || skill.name}
    </LinkButton>
  )
}

export function CompanyLink({ company, children, ...props }) {
  return (
    <LinkButton
      href={`/companies?highlight=${company._key || company.id}`}
      variant="company"
      previewContent={
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{company.description || `${company.industry} company`}</p>
          <div className="flex justify-between text-xs">
            <span>Industry: <strong>{company.industry}</strong></span>
            <span>Size: <strong>{company.employeeCount} employees</strong></span>
          </div>
        </div>
      }
      showPreview={true}
      {...props}
    >
      {children || company.name}
    </LinkButton>
  )
}

export function AuthorityLink({ authority, children, ...props }) {
  return (
    <LinkButton
      href={`/hiring-authorities?highlight=${authority._key || authority.id}`}
      variant="authority"
      previewContent={
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{authority.role} with {authority.hiringPower} hiring power</p>
          <div className="flex justify-between text-xs">
            <span>Level: <strong>{authority.level}</strong></span>
            <span>Decision Maker: <strong>{authority.decisionMaker ? 'Yes' : 'No'}</strong></span>
          </div>
        </div>
      }
      showPreview={true}
      {...props}
    >
      {children || authority.name}
    </LinkButton>
  )
}

export function PositionLink({ position, children, ...props }) {
  return (
    <LinkButton
      href={`/positions?highlight=${position._key || position.id}`}
      variant="position"
      previewContent={
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{position.level} level {position.type} position</p>
          <div className="text-xs">
            <span>Requirements: <strong>{position.requirements?.slice(0, 3).join(', ')}</strong></span>
          </div>
        </div>
      }
      showPreview={true}
      {...props}
    >
      {children || position.title}
    </LinkButton>
  )
}
