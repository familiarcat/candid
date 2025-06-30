import { useEffect } from 'react'
import Navigation from './Navigation'
import PerformanceMonitorWidget from './optimization/PerformanceMonitorWidget'
import { accessibilityManager } from '../../lib/accessibilitySystem'

export default function Layout({ children }) {
  // Initialize accessibility features
  useEffect(() => {
    accessibilityManager.initialize()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:no-underline"
      >
        Skip to main content
      </a>

      <Navigation />

      <main
        id="main-content"
        className="container-app section-padding"
        role="main"
        aria-label="Main content"
        tabIndex="-1"
      >
        {children}
      </main>

      {/* Development tools */}
      <PerformanceMonitorWidget />
    </div>
  )
}