import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import { cssAnimator, ANIMATION_CONFIG } from '../lib/animationSystem'
import { mobileDetector, touchAnimator } from '../lib/mobileAnimations'

export default function Navigation() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  const hamburgerRef = useRef(null)

  // Handle mobile menu animation
  const toggleMobileMenu = async () => {
    if (!mobileMenuRef.current) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
      return
    }

    if (isMobileMenuOpen) {
      // Close animation
      await cssAnimator.slideUp(mobileMenuRef.current, {
        duration: mobileDetector.getOptimalAnimationDuration(250)
      })
      setIsMobileMenuOpen(false)
    } else {
      // Open animation
      setIsMobileMenuOpen(true)
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 10))
      await cssAnimator.slideDown(mobileMenuRef.current, {
        duration: mobileDetector.getOptimalAnimationDuration(300)
      })
    }

    // Animate hamburger icon
    if (hamburgerRef.current) {
      cssAnimator.scale(hamburgerRef.current, 1.1, { duration: 100 }).then(() => {
        cssAnimator.scale(hamburgerRef.current, 1, { duration: 100 })
      })
    }
  }

  // Setup touch animations for mobile menu items
  useEffect(() => {
    if (!mobileMenuRef.current || !isMobileMenuOpen) return

    const menuItems = mobileMenuRef.current.querySelectorAll('a')
    const cleanupFunctions = []

    menuItems.forEach((item, index) => {
      // Stagger animation for menu items
      setTimeout(() => {
        cssAnimator.fadeIn(item, {
          duration: mobileDetector.getOptimalAnimationDuration(200)
        })
      }, index * 50)

      // Add touch animation
      const cleanup = touchAnimator.animateTouchButton(item, {
        pressScale: 0.95,
        duration: 150
      })
      cleanupFunctions.push(cleanup)
    })

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup())
    }
  }, [isMobileMenuOpen])

  // For development: keep admin controls active
  // TODO: Implement user authentication system
  const isAdmin = true // Development mode - always true

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

  // Debug: Log navigation items to ensure all 9 are present
  console.log('Navigation items count:', navItems.length, navItems.map(item => item.name))

  const adminItems = [
    { name: 'Admin', path: '/admin', icon: '⚙️', type: 'outline' },
    { name: 'Visualize', path: '/visualizations', icon: '📊', type: 'outline' },
    // External portal link - only show in production
    ...(process.env.NODE_ENV === 'production' ? [
      { name: 'Portal Login', path: 'https://portal.candid-connections.com/user/login', icon: '🔗', type: 'primary', external: true }
    ] : [])
  ]

  return (
    <nav
      id="navigation"
      className="bg-white shadow-soft border-b border-candid-gray-200"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-app">
        {/* Main Navigation Row */}
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
                  Talent Network
                </h1>
                <p className="text-sm text-candid-gray-600 -mt-1">Connect • Match • Succeed</p>
              </div>
            </Link>
          </div>

          {/* Brockman/Bento Progressive Navigation - Left Aligned */}
          {/* Extra Large screens: Full size navigation */}
          <div className="hidden 2xl:flex flex-1 ml-8">
            <div className="flex items-center space-x-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item-xl ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-base mb-1">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Large screens: Medium size navigation */}
          <div className="hidden xl:flex 2xl:hidden flex-1 ml-6">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item-lg ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-sm mb-0.5">{item.icon}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Medium screens: Small size navigation (10pt threshold) */}
          <div className="hidden lg:flex xl:hidden flex-1 ml-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item-md ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs font-medium leading-tight">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Small screens: Icon-only navigation (below 10pt threshold) */}
          <div className="hidden md:flex lg:hidden flex-1 ml-4">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={router.pathname === item.path ? 'nav-icon-only-active' : 'nav-icon-only'}
                  title={item.name}
                >
                  <span className="text-lg">{item.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              ref={hamburgerRef}
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-candid-navy-600 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-90' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Admin Controls Row - Second Tier (Brockman/Bento Left-Aligned) */}
        {isAdmin && (
          <div className="hidden md:block admin-controls-row">
            {/* Large+ screens: Full admin controls */}
            <div className="hidden lg:flex items-center ml-8 space-x-3">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className={`admin-control-lg ${
                    item.type === 'primary' ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Medium screens: Compact admin controls */}
            <div className="flex lg:hidden items-center ml-6 space-x-2">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className={`admin-control-md ${
                    item.type === 'primary' ? 'btn-primary' : 'btn-outline'
                  }`}
                  title={item.name}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="text-xs">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            ref={mobileMenuRef}
            className="lg:hidden border-t border-candid-gray-200 py-4 overflow-hidden"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="space-y-2">
              {/* Main Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] opacity-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    router.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link'
                  }`}
                  role="menuitem"
                  aria-current={router.pathname === item.path ? 'page' : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Admin Controls for Mobile */}
              {isAdmin && (
                <div className="mobile-nav-section space-y-2">
                  <div className="mobile-nav-header">
                    Admin Controls
                  </div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={toggleMobileMenu}
                      {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                      className={`block w-full text-center min-h-[48px] opacity-0 ${
                        item.type === 'primary' ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}