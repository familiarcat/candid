// Match Relevance Panel - Shows why matches between job seekers and hiring authorities are relevant
// Displays match scores, reasons, and hierarchical fit based on our matching algorithm

import { useState } from 'react'

export default function MatchRelevancePanel({ matches = [], stats = {} }) {
  const [expandedMatch, setExpandedMatch] = useState(null)

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Weak'
  }

  const getStrengthIndicator = (strength) => {
    const percentage = Math.round(strength * 100)
    if (percentage >= 80) return { color: 'bg-green-500', label: 'Strong' }
    if (percentage >= 60) return { color: 'bg-yellow-500', label: 'Medium' }
    if (percentage >= 40) return { color: 'bg-orange-500', label: 'Weak' }
    return { color: 'bg-red-500', label: 'Poor' }
  }

  if (matches.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Match Analysis</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">🔍</div>
          <p className="text-gray-600">No matches found in current view</p>
          <p className="text-sm text-gray-500 mt-1">
            Adjust filters or edge depth to see more connections
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Match Analysis</h3>
        <p className="text-sm text-gray-600 mt-1">
          {matches.length} match{matches.length !== 1 ? 'es' : ''} found
        </p>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {matches.map((match, index) => {
            const isExpanded = expandedMatch === index
            const scoreColorClass = getScoreColor(match.score)
            const strengthIndicator = getStrengthIndicator(match.strength)

            return (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Match Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedMatch(isExpanded ? null : index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    {/* Score Badge */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${scoreColorClass}`}>
                      {match.score}%
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Match Participants */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600">👥</span>
                      <span className="text-sm font-medium text-gray-800">
                        {match.source?.name || 'Job Seeker'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-600">👔</span>
                      <span className="text-sm font-medium text-gray-800">
                        {match.target?.name || 'Hiring Authority'}
                      </span>
                    </div>
                  </div>

                  {/* Connection Strength */}
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Connection:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${strengthIndicator.color}`}
                        style={{ width: `${match.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {strengthIndicator.label}
                    </span>
                  </div>

                  {/* Quick Match Label */}
                  {match.label && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {match.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    {/* Match Quality Assessment */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Match Quality: {getScoreLabel(match.score)}
                      </h4>
                      <div className="text-sm text-gray-600">
                        This match scored {match.score}% based on our comprehensive algorithm that evaluates:
                      </div>
                    </div>

                    {/* Match Reasons */}
                    {match.reasons && match.reasons.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Why This Match Works</h4>
                        <div className="space-y-2">
                          {match.reasons.map((reason, reasonIndex) => (
                            <div key={reasonIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scoring Breakdown */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Scoring Factors</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skill Alignment (40%)</span>
                          <span className="font-medium">
                            {Math.round(match.score * 0.4)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company Size Match (30%)</span>
                          <span className="font-medium">
                            {Math.round(match.score * 0.3)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience Level (20%)</span>
                          <span className="font-medium">
                            {Math.round(match.score * 0.2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decision Power (10%)</span>
                          <span className="font-medium">
                            {Math.round(match.score * 0.1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Entity Details */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Job Seeker Details */}
                      {match.source && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-orange-600">👥</span>
                            <span className="text-sm font-medium text-gray-800">Job Seeker</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <div><strong>Name:</strong> {match.source.name}</div>
                            {match.source.type && (
                              <div><strong>Type:</strong> {match.source.type}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hiring Authority Details */}
                      {match.target && (
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-cyan-600">👔</span>
                            <span className="text-sm font-medium text-gray-800">Hiring Authority</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <div><strong>Name:</strong> {match.target.name}</div>
                            {match.target.type && (
                              <div><strong>Type:</strong> {match.target.type}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Suggestions */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Recommended Actions</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {match.score >= 85 && (
                          <div>• Schedule immediate interview - excellent fit</div>
                        )}
                        {match.score >= 70 && match.score < 85 && (
                          <div>• Consider for interview with skill assessment</div>
                        )}
                        {match.score >= 55 && match.score < 70 && (
                          <div>• Evaluate for training opportunities</div>
                        )}
                        {match.score < 55 && (
                          <div>• Consider for future opportunities with development</div>
                        )}
                        <div>• Review detailed skill alignment</div>
                        <div>• Assess cultural fit and team dynamics</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Average Score:</span>
            <span className="font-medium">
              {Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>High Quality Matches:</span>
            <span className="font-medium">
              {matches.filter(m => m.score >= 80).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
