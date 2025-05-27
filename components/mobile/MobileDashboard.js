// Mobile-Optimized Dashboard Component
// Touch-friendly dashboard interface for mobile devices

import { useState, useEffect, useRef } from 'react'
import { dashboardManager, WIDGET_TYPES, WIDGET_CONFIGS } from '../../lib/dashboardSystem'
import { MobileResponsiveUtils } from '../../lib/mobileVisualizationControls'

export default function MobileDashboard({
  dashboard,
  onDashboardChange = () => {},
  className = ''
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [swipeThreshold] = useState(50)
  const containerRef = useRef(null)

  // Get mobile-specific settings
  const isMobile = MobileResponsiveUtils.isMobile()
  const isTablet = MobileResponsiveUtils.isTablet()
  const touchCapabilities = MobileResponsiveUtils.getTouchCapabilities()

  // Organize widgets into mobile-friendly tabs
  const widgetTabs = organizeWidgetsIntoTabs(dashboard?.getWidgets() || [])

  useEffect(() => {
    if (isMobile && containerRef.current) {
      // Add touch event listeners for swipe navigation
      const container = containerRef.current
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: false })

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isMobile])

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    // Prevent default scrolling during horizontal swipes
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY)
    
    if (deltaX > deltaY) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY

    // Check for horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && activeTab > 0) {
        // Swipe right - previous tab
        setActiveTab(activeTab - 1)
      } else if (deltaX < 0 && activeTab < widgetTabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(activeTab + 1)
      }
    }
  }

  const handleAddWidget = (widgetType) => {
    if (dashboard) {
      dashboard.addWidget(widgetType)
      onDashboardChange(dashboard)
      setShowWidgetPicker(false)
    }
  }

  const handleRemoveWidget = (widgetId) => {
    if (dashboard) {
      dashboard.removeWidget(widgetId)
      onDashboardChange(dashboard)
    }
  }

  const renderMobileWidget = (widget) => {
    const config = WIDGET_CONFIGS[widget.type]
    
    return (
      <div
        key={widget.id}
        className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden"
      >
        {/* Mobile Widget Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{config?.icon}</span>
            <h3 className="font-medium text-gray-900 text-sm">{widget.title}</h3>
          </div>
          {isEditing && (
            <button
              onClick={() => handleRemoveWidget(widget.id)}
              className="text-red-600 hover:text-red-800 text-sm p-1 rounded-full hover:bg-red-50"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile Widget Content */}
        <div className="p-3">
          {renderMobileWidgetContent(widget)}
        </div>
      </div>
    )
  }

  const renderMobileWidgetContent = (widget) => {
    // Simplified mobile-friendly widget content
    switch (widget.type) {
      case WIDGET_TYPES.NETWORK_STATS:
        return (
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">124</div>
              <div className="text-xs text-gray-600">Job Seekers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">37</div>
              <div className="text-xs text-gray-600">Authorities</div>
            </div>
          </div>
        )

      case WIDGET_TYPES.MATCH_QUALITY:
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>High Quality</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        )

      case WIDGET_TYPES.RECENT_ACTIVITY:
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Match {i}</span>
                <span className="text-gray-600">2h ago</span>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 py-4">
            <div className="text-2xl mb-1">{WIDGET_CONFIGS[widget.type]?.icon}</div>
            <div className="text-xs">Mobile view</div>
          </div>
        )
    }
  }

  const renderTabNavigation = () => (
    <div className="flex bg-white border-b border-gray-200 overflow-x-auto">
      {widgetTabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === index
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </div>
  )

  const renderMobileWidgetPicker = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Add Widget</h3>
          <button
            onClick={() => setShowWidgetPicker(false)}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {Object.entries(WIDGET_CONFIGS).map(([type, config]) => (
            <button
              key={type}
              onClick={() => handleAddWidget(type)}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
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
  )

  if (!dashboard) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">📱</div>
        <div className="text-gray-600">No dashboard available</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`mobile-dashboard ${className}`}>
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{dashboard.name}</h2>
            <p className="text-sm text-gray-600">
              {dashboard.getWidgets().length} widgets
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isEditing ? '✓' : '✏️'}
            </button>

            {isEditing && (
              <button
                onClick={() => setShowWidgetPicker(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                ➕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {widgetTabs.length > 1 && renderTabNavigation()}

      {/* Swipe Indicator */}
      {isMobile && widgetTabs.length > 1 && (
        <div className="bg-blue-50 px-4 py-2 text-center">
          <div className="text-xs text-blue-600">
            👈 Swipe left/right to navigate • Tab {activeTab + 1} of {widgetTabs.length}
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="p-4">
        {widgetTabs[activeTab]?.widgets.map(renderMobileWidget)}
      </div>

      {/* Mobile Widget Picker */}
      {showWidgetPicker && renderMobileWidgetPicker()}
    </div>
  )
}

/**
 * Organize widgets into mobile-friendly tabs
 */
function organizeWidgetsIntoTabs(widgets) {
  const tabs = [
    {
      name: 'Overview',
      icon: '📊',
      widgets: widgets.filter(w => 
        [WIDGET_TYPES.NETWORK_STATS, WIDGET_TYPES.MATCH_QUALITY].includes(w.type)
      )
    },
    {
      name: 'Activity',
      icon: '⚡',
      widgets: widgets.filter(w => 
        [WIDGET_TYPES.RECENT_ACTIVITY, WIDGET_TYPES.TOP_PERFORMERS].includes(w.type)
      )
    },
    {
      name: 'Analysis',
      icon: '🔍',
      widgets: widgets.filter(w => 
        [WIDGET_TYPES.SKILL_GAPS, WIDGET_TYPES.HIRING_TRENDS].includes(w.type)
      )
    },
    {
      name: 'More',
      icon: '⋯',
      widgets: widgets.filter(w => 
        ![
          WIDGET_TYPES.NETWORK_STATS, WIDGET_TYPES.MATCH_QUALITY,
          WIDGET_TYPES.RECENT_ACTIVITY, WIDGET_TYPES.TOP_PERFORMERS,
          WIDGET_TYPES.SKILL_GAPS, WIDGET_TYPES.HIRING_TRENDS
        ].includes(w.type)
      )
    }
  ]

  // Return only tabs that have widgets
  return tabs.filter(tab => tab.widgets.length > 0)
}
