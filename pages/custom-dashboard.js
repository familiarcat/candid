// Full Custom Dashboard Page for Candid Connections
// Provides complete customizable analytics workspace

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useData } from '../contexts/DataContext'
import { dashboardManager, WIDGET_TYPES, WIDGET_CONFIGS } from '../lib/dashboardSystem'
import MobileDashboard from '../components/mobile/MobileDashboard'
import { MobileResponsiveUtils } from '../lib/mobileVisualizationControls'

export default function CustomDashboard() {
  const { data } = useData()
  const [currentDashboard, setCurrentDashboard] = useState(null)
  const [dashboards, setDashboards] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mock user ID (in production, this would come from authentication)
  const userId = 'user_demo'

  useEffect(() => {
    // Mobile detection
    setIsMobile(MobileResponsiveUtils.isMobile())

    const handleResize = () => {
      setIsMobile(MobileResponsiveUtils.isMobile())
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  useEffect(() => {
    // Load existing dashboards
    const existingDashboards = dashboardManager.getDashboards(userId)
    setDashboards(existingDashboards)

    // Set current dashboard or create default
    let dashboard = dashboardManager.getCurrentDashboard()
    if (!dashboard && existingDashboards.length > 0) {
      dashboard = existingDashboards[0]
      dashboardManager.setCurrentDashboard(dashboard.id)
    } else if (!dashboard) {
      dashboard = dashboardManager.createDefaultDashboard(userId)
    }

    setCurrentDashboard(dashboard)
  }, [userId])

  const handleCreateDashboard = () => {
    const name = prompt('Dashboard name:')
    if (name) {
      const dashboard = dashboardManager.createDashboard(name, '', userId)
      setDashboards(dashboardManager.getDashboards(userId))
      setCurrentDashboard(dashboard)
      dashboardManager.setCurrentDashboard(dashboard.id)
    }
  }

  const handleSwitchDashboard = (dashboardId) => {
    const dashboard = dashboardManager.getDashboard(dashboardId)
    if (dashboard) {
      setCurrentDashboard(dashboard)
      dashboardManager.setCurrentDashboard(dashboardId)
    }
  }

  const handleAddWidget = (widgetType) => {
    if (currentDashboard) {
      const widgetId = currentDashboard.addWidget(widgetType)
      setCurrentDashboard({ ...currentDashboard })
      setShowWidgetPicker(false)
    }
  }

  const handleRemoveWidget = (widgetId) => {
    if (currentDashboard && confirm('Remove this widget?')) {
      currentDashboard.removeWidget(widgetId)
      setCurrentDashboard({ ...currentDashboard })
    }
  }

  const renderWidget = (widget) => {
    const config = WIDGET_CONFIGS[widget.type]

    return (
      <div
        key={widget.id}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        style={{
          gridColumn: `span ${widget.size.width}`,
          gridRow: `span ${widget.size.height}`
        }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{config?.icon}</span>
            <h3 className="font-medium text-gray-900">{widget.title}</h3>
          </div>
          {isEditing && (
            <button
              onClick={() => handleRemoveWidget(widget.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Widget Content */}
        <div className="p-4">
          {renderWidgetContent(widget)}
        </div>
      </div>
    )
  }

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case WIDGET_TYPES.NETWORK_STATS:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data?.jobSeekers?.length || 0}</div>
                <div className="text-sm text-gray-600">Job Seekers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data?.hiringAuthorities?.length || 0}</div>
                <div className="text-sm text-gray-600">Authorities</div>
              </div>
            </div>
            <div className="text-center pt-2 border-t">
              <div className="text-xl font-bold text-purple-600">{data?.matches?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
          </div>
        )

      case WIDGET_TYPES.MATCH_QUALITY:
        const highQualityMatches = data?.matches?.filter(m => m.score > 80).length || 0
        const mediumQualityMatches = data?.matches?.filter(m => m.score > 60 && m.score <= 80).length || 0
        const totalMatches = data?.matches?.length || 1

        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Quality (80%+)</span>
                <span>{highQualityMatches}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(highQualityMatches / totalMatches) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Medium Quality (60-80%)</span>
                <span>{mediumQualityMatches}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${(mediumQualityMatches / totalMatches) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )

      case WIDGET_TYPES.SKILL_GAPS:
        const skills = data?.skills || []
        const topSkillGaps = skills.slice(0, 5)

        return (
          <div className="space-y-2">
            {topSkillGaps.length > 0 ? (
              topSkillGaps.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-red-600">High Demand</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No skill gaps identified</div>
            )}
          </div>
        )

      case WIDGET_TYPES.COMPANY_OVERVIEW:
        const companies = data?.companies || []
        const topCompanies = companies.slice(0, 3)

        return (
          <div className="space-y-2">
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{company.name}</span>
                  <span className="text-xs text-blue-600">{company.size || 'Unknown'}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No companies available</div>
            )}
          </div>
        )

      case WIDGET_TYPES.RECENT_ACTIVITY:
        const recentMatches = data?.matches?.slice(0, 5) || []
        return (
          <div className="space-y-2">
            {recentMatches.length > 0 ? (
              recentMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{match.jobSeekerName}</span>
                  <span className="text-xs text-gray-600">{match.score}%</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No recent activity</div>
            )}
          </div>
        )

      case WIDGET_TYPES.TOP_PERFORMERS:
        const topMatches = data?.matches?.sort((a, b) => b.score - a.score).slice(0, 3) || []
        return (
          <div className="space-y-3">
            {topMatches.length > 0 ? (
              topMatches.map((match, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {match.jobSeekerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {match.authorityName}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    {match.score}%
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No matches yet</div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">{WIDGET_CONFIGS[widget.type]?.icon}</div>
            <div className="text-sm">Widget content coming soon</div>
          </div>
        )
    }
  }

  if (!currentDashboard) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Dashboard...</h1>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Custom Dashboard - Candid Connections</title>
        <meta name="description" content="Customizable analytics dashboard" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {isMobile ? (
          /* Mobile Dashboard */
          <MobileDashboard
            dashboard={currentDashboard}
            onDashboardChange={setCurrentDashboard}
          />
        ) : (
          /* Desktop Dashboard */
          <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentDashboard.name}</h1>
                <p className="text-gray-600">
                  {currentDashboard.description || 'Personalized analytics workspace'}
                </p>
              </div>

          {/* Dashboard Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Dashboard Selector */}
            <select
              value={currentDashboard.id}
              onChange={(e) => handleSwitchDashboard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ➕ New Dashboard
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isEditing ? '✓ Done' : '✏️ Edit'}
            </button>

            {isEditing && (
              <button
                onClick={() => setShowWidgetPicker(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                ➕ Add Widget
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div
          className="grid gap-6 auto-rows-fr"
          style={{
            gridTemplateColumns: `repeat(${currentDashboard.layout.columns}, 1fr)`,
            minHeight: '600px'
          }}
        >
          {currentDashboard.getWidgets().filter(w => w.isVisible).map(renderWidget)}
        </div>

        {/* Widget Picker Modal */}
        {showWidgetPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Add Widget</h3>
                <button
                  onClick={() => setShowWidgetPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(WIDGET_CONFIGS).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => handleAddWidget(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{config.title}</div>
                        <div className="text-sm text-gray-600">{config.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
            </>
          )}
      </div>
    </Layout>
  )
}
