import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Primary navigation - core user flows (Salinger: progressive disclosure)
  const primaryNavItems = [
    { name: 'Dashboard', path: '/', icon: '🏠', desc: 'Overview' },
    { name: 'Matches', path: '/matches', icon: '🎯', desc: 'Connections' },
    { name: 'Authorities', path: '/hiring-authorities', icon: '👔', desc: 'Decision Makers' },
    { name: 'Seekers', path: '/job-seekers', icon: '👥', desc: 'Candidates' },
    { name: 'Companies', path: '/companies', icon: '🏢', desc: 'Organizations' }
  ]

  // Secondary navigation - analysis and tools (Brockman: descriptive clarity)
  const secondaryNavItems = [
    { name: 'Positions', path: '/positions', icon: '📋', desc: 'Open Roles' },
    { name: 'Skills', path: '/skills', icon: '🛠️', desc: 'Market Analysis' },
    { name: 'Network', path: '/global-view', icon: '🌐', desc: 'Graph View' }
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

          {/* Desktop Navigation - Progressive Disclosure (Salinger/Brockman) */}
          <div className="hidden lg:block flex-1 max-w-6xl mx-8">
            <div className="flex items-center justify-center space-x-6">
              {/* Primary Navigation - Core User Flows */}
              <div className="flex items-center space-x-1">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      router.pathname === item.path
                        ? 'nav-link-active'
                        : 'nav-link'
                    }`}
                  >
                    <span className="text-base mb-1">{item.icon}</span>
                    <span className="text-xs">{item.name}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-candid-gray-500">
                      {item.desc}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-candid-gray-300"></div>

              {/* Secondary Navigation - Analysis Tools */}
              <div className="flex items-center space-x-1">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      router.pathname === item.path
                        ? 'nav-link-active'
                        : 'nav-link'
                    }`}
                  >
                    <span className="text-base mb-1">{item.icon}</span>
                    <span className="text-xs">{item.name}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-candid-gray-500">
                      {item.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons - Compact */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/visualizations"
              className="btn-outline text-sm py-2 px-3"
            >
              📊 Visualize
            </Link>
            <Link
              href="/admin"
              className="btn-outline text-sm py-2 px-3"
            >
              ⚙️ Admin
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
            <div className="space-y-4">
              {/* Primary Navigation */}
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-candid-gray-500 uppercase tracking-wider">Core</h3>
                </div>
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      router.pathname === item.path
                        ? 'nav-link-active'
                        : 'nav-link'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-xs text-candid-gray-500">{item.desc}</span>
                  </Link>
                ))}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-candid-gray-500 uppercase tracking-wider">Analysis</h3>
                </div>
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      router.pathname === item.path
                        ? 'nav-link-active'
                        : 'nav-link'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-xs text-candid-gray-500">{item.desc}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-2">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-candid-gray-500 uppercase tracking-wider">Tools</h3>
                </div>
                <Link
                  href="/visualizations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full btn-outline text-center"
                >
                  📊 Visualize
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full btn-outline text-center"
                >
                  ⚙️ Admin
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