'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { useData } from '../../contexts/DataContext'
import { CompanyLink, SkillLink, PositionLink } from '../../components/ui/LinkButton'

export default function HiringAuthorityProfile() {
  const router = useRouter()
  const { id } = router.query
  const { state } = useData()
  const [authority, setAuthority] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchAuthority = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/hiring-authorities?id=${id}`)
        
        if (!response.ok) {
          throw new Error('Authority not found')
        }
        
        const data = await response.json()
        setAuthority(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthority()
  }, [id])

  const getHiringPowerColor = (power) => {
    switch (power) {
      case 'Ultimate': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'C-Suite': return 'bg-purple-100 text-purple-800'
      case 'Executive': return 'bg-blue-100 text-blue-800'
      case 'Director': return 'bg-green-100 text-green-800'
      case 'Manager': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-candid-gray-600">Loading hiring authority profile...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !authority) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authority Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The hiring authority you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => router.push('/hiring-authorities')}
              className="btn-primary"
            >
              Back to Authorities
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{authority.avatar || '👔'}</div>
              <div>
                <h1 className="text-3xl font-bold text-secondary-800">{authority.name}</h1>
                <p className="text-xl text-candid-gray-600">{authority.role}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`badge ${getLevelColor(authority.level)}`}>
                    {authority.level}
                  </span>
                  <span className={`badge ${getHiringPowerColor(authority.hiringPower)}`}>
                    {authority.hiringPower} Hiring Power
                  </span>
                  {authority.decisionMaker && (
                    <span className="badge bg-green-100 text-green-800">Decision Maker</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => router.back()}
                className="btn-outline"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Company</h2>
              {authority.company && (
                <div className="space-y-3">
                  <CompanyLink company={authority.company} size="lg" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Industry:</span>
                      <p className="text-gray-600">{authority.company.industry}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <p className="text-gray-600">{authority.company.size}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {authority.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-secondary-800 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{authority.bio}</p>
              </div>
            )}

            {/* Skills Looking For */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Skills Looking For</h2>
              {authority.skillsLookingFor && authority.skillsLookingFor.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {authority.skillsLookingFor.map((skillName, index) => (
                    <SkillLink 
                      key={index} 
                      skill={{ name: skillName, _key: skillName.toLowerCase().replace(/\s+/g, '-') }} 
                      size="sm" 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific skills listed</p>
              )}
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Open Positions</h2>
              {authority.positions && authority.positions.length > 0 ? (
                <div className="space-y-3">
                  {authority.positions.map((position) => (
                    <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-secondary-800">{position.title}</h3>
                          <p className="text-sm text-gray-600">{position.level} • {position.type}</p>
                        </div>
                        <span className={`badge ${
                          position.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {position.status}
                        </span>
                      </div>
                      {position.requirements && position.requirements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {position.requirements.slice(0, 3).map((req, index) => (
                              <span key={index} className="badge badge-secondary text-xs">{req}</span>
                            ))}
                            {position.requirements.length > 3 && (
                              <span className="badge badge-secondary text-xs">
                                +{position.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No open positions currently</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Contact</h2>
              <div className="space-y-3">
                {authority.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{authority.email}</p>
                  </div>
                )}
                {authority.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600">{authority.phone}</p>
                  </div>
                )}
                {authority.linkedIn && (
                  <div>
                    <span className="font-medium text-gray-700">LinkedIn:</span>
                    <a 
                      href={authority.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hiring Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Hiring Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Active Positions:</span>
                  <span className="font-medium">{authority.positions?.filter(p => p.status === 'active').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Positions:</span>
                  <span className="font-medium">{authority.positions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Matches:</span>
                  <span className="font-medium">{authority.matches?.length || 0}</span>
                </div>
                {authority.preferredExperience && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Preferred Experience:</span>
                    <span className="font-medium">{authority.preferredExperience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/matches?authority=${authority.id}`)}
                  className="btn-primary w-full"
                >
                  View Matches
                </button>
                <button
                  onClick={() => router.push(`/job-seekers?authority=${authority.id}`)}
                  className="btn-outline w-full"
                >
                  Find Candidates
                </button>
                <button
                  onClick={() => router.push(`/visualizations?focus=authority&id=${authority.id}`)}
                  className="btn-outline w-full"
                >
                  Network View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
