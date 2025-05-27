import { useState, useRef } from 'react'
import { SkillLink, CompanyLink } from './LinkButton'
import { formatDate } from '../../lib/utils'
import { HoverCard, AnimatedButton, AnimatedIcon } from '../animations/HoverEffects'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'

export default function EnhancedMatchCard({ match, tier, onAction, actionLoading }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const cardRef = useRef(null)
  const scoreRef = useRef(null)

  const score = match.matchScore || match.score || 0

  // Tier-based styling
  const getTierStyling = (tier) => {
    switch (tier) {
      case 'excellent':
        return {
          border: 'border-green-200 hover:border-green-300',
          gradient: 'from-green-50 to-emerald-50',
          scoreGradient: 'from-green-500 to-emerald-600',
          glow: 'hover:shadow-green-100'
        }
      case 'high':
        return {
          border: 'border-blue-200 hover:border-blue-300',
          gradient: 'from-blue-50 to-cyan-50',
          scoreGradient: 'from-blue-500 to-cyan-600',
          glow: 'hover:shadow-blue-100'
        }
      case 'good':
        return {
          border: 'border-yellow-200 hover:border-yellow-300',
          gradient: 'from-yellow-50 to-orange-50',
          scoreGradient: 'from-yellow-500 to-orange-600',
          glow: 'hover:shadow-yellow-100'
        }
      default:
        return {
          border: 'border-gray-200 hover:border-gray-300',
          gradient: 'from-gray-50 to-slate-50',
          scoreGradient: 'from-gray-500 to-slate-600',
          glow: 'hover:shadow-gray-100'
        }
    }
  }

  const styling = getTierStyling(tier)

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const handleAction = async (action) => {
    if (onAction) {
      // Animate score badge on action
      if (scoreRef.current) {
        await cssAnimator.pulse(scoreRef.current, { pulses: 2, intensity: 1.2 })
      }
      await onAction(match.id, action)
    }
  }

  const handleExpandToggle = async () => {
    setIsExpanded(!isExpanded)
    // Small bounce animation when expanding/collapsing
    if (cardRef.current) {
      await cssAnimator.scale(cardRef.current, 1.02, {
        duration: ANIMATION_CONFIG.DURATION.FAST
      })
      await cssAnimator.scale(cardRef.current, 1, {
        duration: ANIMATION_CONFIG.DURATION.FAST
      })
    }
  }

  return (
    <HoverCard
      ref={cardRef}
      hoverScale={1.02}
      hoverShadow={true}
      className={`
        bg-gradient-to-br ${styling.gradient}
        rounded-xl border-2 ${styling.border}
        transition-all duration-300 ease-in-out
        ${styling.glow}
        overflow-hidden
      `}
    >
      {/* Header with Score and Status */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div
            ref={scoreRef}
            className={`
              inline-flex items-center px-4 py-2 rounded-full text-white font-bold text-lg
              bg-gradient-to-r ${styling.scoreGradient}
              shadow-lg transform transition-transform duration-200 hover:scale-110
            `}
          >
            <AnimatedIcon animation="bounce" trigger="hover">
              {Math.round(score)}%
            </AnimatedIcon>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(match.status)}`}>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </div>
        </div>

        {/* Job Seeker Info */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
              {match.jobSeeker?.name?.charAt(0) || 'J'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{match.jobSeeker?.name || 'Unknown Job Seeker'}</h4>
              <p className="text-gray-600 text-sm">{match.jobSeeker?.title || 'No title'}</p>
            </div>
          </div>

          {/* Skills Preview */}
          {match.jobSeeker?.skills && match.jobSeeker.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {match.jobSeeker.skills.slice(0, showAllSkills ? undefined : 3).map((skill, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 border border-gray-200">
                  {skill}
                </span>
              ))}
              {match.jobSeeker.skills.length > 3 && (
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {showAllSkills ? 'Show Less' : `+${match.jobSeeker.skills.length - 3} more`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hiring Authority Info */}
        {match.hiringAuthority && (
          <div className="mb-4 pb-4 border-b border-white/50">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                {match.hiringAuthority.name?.charAt(0) || 'H'}
              </div>
              <div>
                <h5 className="font-medium text-gray-900">{match.hiringAuthority.name}</h5>
                <p className="text-sm text-gray-600">{match.hiringAuthority.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                {match.hiringAuthority.company}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                {match.hiringAuthority.level}
              </span>
            </div>
          </div>
        )}

        {/* Quick Match Reasons */}
        {match.matchReasons && match.matchReasons.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-700 space-y-1">
              {match.matchReasons.slice(0, isExpanded ? undefined : 2).map((reason, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
              {match.matchReasons.length > 2 && (
                <button
                  onClick={handleExpandToggle}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                >
                  <AnimatedIcon animation="rotate" trigger="hover" className="mr-1">
                    {isExpanded ? '▲' : '▼'}
                  </AnimatedIcon>
                  {isExpanded ? 'Show Less' : `+${match.matchReasons.length - 2} more reasons`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        {match.status === 'pending' && (
          <div className="flex space-x-2">
            <AnimatedButton
              onClick={() => handleAction('approved')}
              disabled={actionLoading[match.id]}
              variant="success"
              size="medium"
              className="flex-1"
            >
              {actionLoading[match.id] ? (
                <AnimatedIcon animation="rotate" trigger="click">⟳</AnimatedIcon>
              ) : (
                '✓ Approve'
              )}
            </AnimatedButton>
            <AnimatedButton
              onClick={() => handleAction('rejected')}
              disabled={actionLoading[match.id]}
              variant="danger"
              size="medium"
              className="flex-1"
            >
              {actionLoading[match.id] ? (
                <AnimatedIcon animation="rotate" trigger="click">⟳</AnimatedIcon>
              ) : (
                '✗ Reject'
              )}
            </AnimatedButton>
          </div>
        )}

        {match.status !== 'pending' && (
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(match.status)}`}>
              {match.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
            </span>
            {match.adminNote && (
              <p className="text-xs text-gray-600 mt-2">{match.adminNote}</p>
            )}
          </div>
        )}
      </div>
    </HoverCard>
  )
}
