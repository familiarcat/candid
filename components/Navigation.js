import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Matches', path: '/matches', icon: '🎯' },
    { name: 'Job Seekers', path: '/job-seekers', icon: '👥' },
    { name: 'Hiring Authorities', path: '/hiring-authorities', icon: '👔' },
    { name: 'Companies', path: '/companies', icon: '🏢' },
    { name: 'Positions', path: '/positions', icon: '📋' },
    { name: 'Skills', path: '/skills', icon: '🛠️' },
    { name: 'Visualizations', path: '/visualizations', icon: '📊' },
    { name: 'Network View', path: '/global-view', icon: '🌐' }
  ]

  return (
    <nav className="bg-white shadow-soft border-b border-candid-gray-200">
      <div className="container-app">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Geometric Network Style */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Geometric Network Logo */}
              <div className="w-12 h-12 relative group-hover:scale-105 transition-transform duration-200">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  {/* Outer circle */}
                  <circle cx="24" cy="24" r="22" fill="none" stroke="#1e3a8a" strokeWidth="2"/>
                  {/* Inner network nodes */}
                  <circle cx="24" cy="12" r="3" fill="#00d4ff"/>
                  <circle cx="36" cy="24" r="3" fill="#00d4ff"/>
                  <circle cx="24" cy="36" r="3" fill="#00d4ff"/>
                  <circle cx="12" cy="24" r="3" fill="#00d4ff"/>
                  <circle cx="24" cy="24" r="4" fill="#1e3a8a"/>
                  {/* Connection lines */}
                  <line x1="24" y1="15" x2="24" y2="20" stroke="#00d4ff" strokeWidth="2"/>
                  <line x1="33" y1="24" x2="28" y2="24" stroke="#00d4ff" strokeWidth="2"/>
                  <line x1="24" y1="33" x2="24" y2="28" stroke="#00d4ff" strokeWidth="2"/>
                  <line x1="15" y1="24" x2="20" y2="24" stroke="#00d4ff" strokeWidth="2"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-secondary-800 group-hover:text-primary-500 transition-colors duration-200">
                  Candid Connections
                </h1>
                <p className="text-sm text-candid-gray-600 -mt-1">Katra Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Compact Grid */}
          <div className="hidden lg:block flex-1 max-w-4xl mx-8">
            <div className="flex items-center justify-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="hidden xl:block">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/admin"
              className="btn-outline text-sm py-2 px-4"
            >
              ⚙️ Admin
            </Link>
            <Link
              href="/visualizations"
              className="btn-outline text-sm py-2 px-4"
            >
              📊 Visualize
            </Link>
            <Link
              href="https://portal.candid-connections.com/user/login"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 px-4"
            >
              Portal Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-candid-navy-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-candid-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-2">
                <Link
                  href="/visualizations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full btn-outline text-center"
                >
                  📊 Visualize
                </Link>
                <Link
                  href="https://portal.candid-connections.com/user/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full btn-primary text-center"
                >
                  Portal Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}