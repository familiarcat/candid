import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function DashboardCards() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [companiesRes, authoritiesRes, jobSeekersRes, skillsRes, positionsRes, matchesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/hiring-authorities'),
          fetch('/api/job-seekers'),
          fetch('/api/skills'),
          fetch('/api/positions'),
          fetch('/api/matches')
        ])

        const [companies, authorities, jobSeekers, skills, positions, matches] = await Promise.all([
          companiesRes.json(),
          authoritiesRes.json(),
          jobSeekersRes.json(),
          skillsRes.json(),
          positionsRes.json(),
          matchesRes.json()
        ])

        // Calculate total connections (all relationships in the graph)
        const jobSeekerSkills = jobSeekers.reduce((total, js) => total + (js.skills?.length || 0), 0)
        const authorityPreferences = authorities.reduce((total, auth) => total + (auth.skillsLookingFor?.length || 0), 0)
        const positionRequirements = positions.reduce((total, pos) => total + (pos.requirements?.length || 0), 0)
        const globalConnections = jobSeekerSkills + authorityPreferences + positionRequirements + matches.length + authorities.length + positions.length

        setStats({
          matches: matches.length,
          jobSeekers: jobSeekers.length,
          companies: companies.length,
          positions: positions.length,
          skills: skills.length,
          hiringAuthorities: authorities.length,
          globalConnections
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Authority Matches',
      icon: '🎯',
      gradient: 'from-primary-500 to-primary-600',
      path: '/matches',
      description: 'Job seeker to hiring authority connections',
      stat: stats.matches,
      statLabel: 'Active Matches'
    },
    {
      title: 'Job Seekers',
      icon: '👥',
      gradient: 'from-secondary-500 to-secondary-600',
      path: '/job-seekers',
      description: 'Candidates seeking the right hiring authority',
      stat: stats.jobSeekers,
      statLabel: 'Candidates'
    },
    {
      title: 'Hiring Authorities',
      icon: '👔',
      gradient: 'from-accent-500 to-accent-600',
      path: '/hiring-authorities',
      description: 'Decision makers across company hierarchies',
      stat: stats.hiringAuthorities,
      statLabel: 'Authorities'
    },
    {
      title: 'Companies',
      icon: '🏢',
      gradient: 'from-candid-blue-500 to-candid-blue-600',
      path: '/companies',
      description: 'Organizational structures and hierarchies',
      stat: stats.companies,
      statLabel: 'Organizations'
    },
    {
      title: 'Positions',
      icon: '📋',
      gradient: 'from-candid-orange-500 to-candid-orange-600',
      path: '/positions',
      description: 'Roles mapped to hiring authorities',
      stat: stats.positions,
      statLabel: 'Open Roles'
    },
    {
      title: 'Network View',
      icon: '🌐',
      gradient: 'from-candid-navy-600 to-candid-navy-700',
      path: '/global-view',
      description: 'Graph visualization of all connections',
      stat: stats.globalConnections,
      statLabel: 'Connections'
    }
  ]

  return (
    <div className="dashboard-grid">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.path}
          className="card-interactive group"
        >
          <div className="card-body">
            {/* Header with Icon and Gradient */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200`}>
                <span className="text-white text-xl">{card.icon}</span>
              </div>

              {/* Stats */}
              <div className="text-right">
                {loading ? (
                  <div className="w-8 h-8 loading-spinner"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-candid-navy-900">
                      {card.stat}
                    </div>
                    <div className="text-xs text-candid-gray-500 uppercase tracking-wide">
                      {card.statLabel}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-candid-navy-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-candid-gray-600 text-sm leading-relaxed">
              {card.description}
            </p>

            {/* Action Indicator */}
            <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors duration-200">
              <span>Explore</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}