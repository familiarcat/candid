import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Job Matches', path: '/matches', icon: '🎯' },
    { name: 'Job Seekers', path: '/job-seekers', icon: '👥' },
    { name: 'Companies', path: '/companies', icon: '🏢' },
    { name: 'Positions', path: '/positions', icon: '📋' },
    { name: 'Skills', path: '/skills', icon: '🛠️' },
    { name: 'Global View', path: '/global-view', icon: '🌐' }
  ]

  return (
    <nav className="bg-white shadow-soft border-b border-candid-gray-200">
      <div className="container-app">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-candid-navy-900 group-hover:text-primary-600 transition-colors duration-200">
                  Candid Connections
                </h1>
                <p className="text-sm text-candid-gray-600 -mt-1">Katra Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/global-view"
              className="btn-outline text-sm py-2 px-4"
            >
              🌐 Network View
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
                  href="/global-view"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full btn-outline text-center"
                >
                  🌐 Network View
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