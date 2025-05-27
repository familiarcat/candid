import Navigation from './Navigation'
import PerformanceDashboard from './PerformanceDashboard'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container-app section-padding">{children}</main>

      {/* Performance monitoring dashboard (development mode) */}
      {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
    </div>
  )
}