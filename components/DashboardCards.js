import Link from 'next/link'
import { useData } from '../contexts/DataContext'

export default function DashboardCards() {
  const { stats, loading } = useData()

  // Calculate global connections for the network view card
  const globalConnections = stats.skillConnections + stats.totalMatches + stats.totalAuthorities + stats.totalPositions

  const cards = [
    {
      title: 'Authority Matches',
      icon: '🎯',
      gradient: 'from-primary-500 to-primary-600',
      path: '/matches',
      description: 'Job seeker to hiring authority connections',
      stat: stats.totalMatches,
      statLabel: 'Active Matches'
    },
    {
      title: 'Job Seekers',
      icon: '👥',
      gradient: 'from-secondary-500 to-secondary-600',
      path: '/job-seekers',
      description: 'Candidates seeking the right hiring authority',
      stat: stats.totalJobSeekers,
      statLabel: 'Candidates'
    },
    {
      title: 'Hiring Authorities',
      icon: '👔',
      gradient: 'from-accent-500 to-accent-600',
      path: '/hiring-authorities',
      description: 'Decision makers across company hierarchies',
      stat: stats.totalAuthorities,
      statLabel: 'Authorities'
    },
    {
      title: 'Companies',
      icon: '🏢',
      gradient: 'from-candid-blue-500 to-candid-blue-600',
      path: '/companies',
      description: 'Organizational structures and hierarchies',
      stat: stats.totalCompanies,
      statLabel: 'Organizations'
    },
    {
      title: 'Positions',
      icon: '📋',
      gradient: 'from-candid-orange-500 to-candid-orange-600',
      path: '/positions',
      description: 'Roles mapped to hiring authorities',
      stat: stats.totalPositions,
      statLabel: 'Open Roles'
    },
    {
      title: 'Network View',
      icon: '🌐',
      gradient: 'from-candid-navy-600 to-candid-navy-700',
      path: '/visualizations',
      description: 'Graph visualization of all connections',
      stat: globalConnections,
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
                {loading.global ? (
                  <div className="w-8 h-8 loading-spinner"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-candid-navy-900">
                      {card.stat || 0}
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