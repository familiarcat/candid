import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { generateSampleGraphData } from '../lib/graphData'
import GraphVisualization2D from '../components/GraphVisualization2D'
import { useData } from '../contexts/DataContext'
import { dashboardManager, WIDGET_TYPES, WIDGET_CONFIGS } from '../lib/dashboardSystem'

export default function Dashboard() {
  const { data } = useData()
  const [stats, setStats] = useState({
    jobSeekers: 0,
    companies: 0,
    positions: 0,
    matches: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCustomDashboard, setShowCustomDashboard] = useState(false)
  const [customDashboard, setCustomDashboard] = useState(null)

  // Mock user ID (in production, this would come from authentication)
  const userId = 'user_demo'

  useEffect(() => {
    // Initialize custom dashboard
    let dashboard = dashboardManager.getCurrentDashboard()
    if (!dashboard) {
      const existingDashboards = dashboardManager.getDashboards(userId)
      if (existingDashboards.length > 0) {
        dashboard = existingDashboards[0]
        dashboardManager.setCurrentDashboard(dashboard.id)
      } else {
        dashboard = dashboardManager.createDefaultDashboard(userId)
      }
    }
    setCustomDashboard(dashboard)

    // In a real app, fetch from API
    // For now, generate sample data
    setTimeout(() => {
      setStats({
        jobSeekers: data?.jobSeekers?.length || 124,
        companies: data?.companies?.length || 37,
        positions: data?.positions?.length || 85,
        matches: data?.matches?.length || 213
      })

      setRecentActivity([
        { id: 1, type: 'match', description: 'New match: John Doe and Senior Developer at TechCorp', time: '2 hours ago' },
        { id: 2, type: 'company', description: 'New company joined: InnovateTech', time: '5 hours ago' },
        { id: 3, type: 'position', description: 'New position posted: Full Stack Developer at WebSolutions', time: '1 day ago' },
        { id: 4, type: 'jobSeeker', description: 'New job seeker: Sarah Johnson', time: '1 day ago' },
        { id: 5, type: 'match', description: 'New match: Emily Chen and UX Designer at DesignHub', time: '2 days ago' }
      ])

      setGraphData(generateSampleGraphData())
      setLoading(false)
    }, 1000)
  }, [data, userId])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'match': return '🤝'
      case 'company': return '🏢'
      case 'position': return '📋'
      case 'jobSeeker': return '👤'
      default: return '📄'
    }
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard | Candid Connections Katra</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 lg:mb-0">Dashboard</h1>

          {/* Enterprise Dashboard Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCustomDashboard(!showCustomDashboard)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCustomDashboard
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 Custom Dashboard
            </button>
            <Link
              href="/visualizations"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              🌐 Visualizations
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Job Seekers</h3>
            <p className="text-3xl font-bold">{stats.jobSeekers}</p>
            <Link href="/job-seekers" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Companies</h3>
            <p className="text-3xl font-bold">{stats.companies}</p>
            <Link href="/companies" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Open Positions</h3>
            <p className="text-3xl font-bold">{stats.positions}</p>
            <Link href="/positions" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm font-medium">Matches</h3>
            <p className="text-3xl font-bold">{stats.matches}</p>
            <Link href="/matches" className="text-indigo-600 text-sm mt-2 inline-block">
              View all →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Network Visualization</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="h-96">
                <GraphVisualization2D data={graphData} />
              </div>
            )}
            <div className="mt-4 text-right">
              <Link href="/network" className="text-indigo-600 text-sm">
                View full network →
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <Link href="/activity" className="text-indigo-600 text-sm">
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Custom Dashboard Section */}
        {showCustomDashboard && customDashboard && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Custom Analytics Dashboard</h2>
              <div className="text-sm text-gray-600">
                {customDashboard.getWidgets().length} widgets • Last updated: {new Date(customDashboard.lastModified).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {customDashboard.getWidgets().slice(0, 4).map(widget => {
                const config = WIDGET_CONFIGS[widget.type]
                return (
                  <div key={widget.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{config?.icon}</span>
                      <h3 className="font-medium text-gray-900 text-sm">{widget.title}</h3>
                    </div>
                    <div className="text-xs text-gray-600">{config?.description}</div>
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => window.open('/custom-dashboard', '_blank')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                🚀 Open Full Custom Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}