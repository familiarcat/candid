import Link from 'next/link'

export default function DashboardCards() {
  const cards = [
    { 
      title: 'Job Matches', 
      icon: '🎯', 
      color: 'bg-emerald-100 border-emerald-300', 
      path: '/matches',
      description: 'View and manage job seeker-position matches'
    },
    { 
      title: 'Job Seekers', 
      icon: '👥', 
      color: 'bg-blue-100 border-blue-300', 
      path: '/job-seekers',
      description: 'Manage candidates and their skills'
    },
    { 
      title: 'Companies', 
      icon: '🏢', 
      color: 'bg-teal-100 border-teal-300', 
      path: '/companies',
      description: 'Explore organizational hierarchies'
    },
    { 
      title: 'Skills', 
      icon: '🛠️', 
      color: 'bg-amber-100 border-amber-300', 
      path: '/skills',
      description: 'Analyze market demand and skill trends'
    },
    { 
      title: 'Global View', 
      icon: '🌐', 
      color: 'bg-indigo-100 border-indigo-300', 
      path: '/global-view',
      description: 'Complete network visualization'
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Link 
          key={card.title} 
          href={card.path}
          className={`block p-6 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${card.color}`}
        >
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{card.icon}</span>
            <h2 className="text-xl font-semibold">{card.title}</h2>
          </div>
          <p className="text-gray-700">{card.description}</p>
        </Link>
      ))}
    </div>
  )
}