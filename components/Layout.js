import Navigation from './Navigation'
import PerformanceMonitorWidget from './optimization/PerformanceMonitorWidget'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container-app section-padding">{children}</main>

      {/* Performance monitoring widget (development mode) */}
      <PerformanceMonitorWidget />
    </div>
  )
}