// Custom Dashboard System for Candid Connections
// Enables users to create personalized analytics workspaces

/**
 * Dashboard Widget Types
 */
export const WIDGET_TYPES = {
  NETWORK_STATS: 'network_stats',
  MATCH_QUALITY: 'match_quality',
  SKILL_GAPS: 'skill_gaps',
  COMPANY_OVERVIEW: 'company_overview',
  HIRING_TRENDS: 'hiring_trends',
  VISUALIZATION: 'visualization',
  RECENT_ACTIVITY: 'recent_activity',
  TOP_PERFORMERS: 'top_performers'
}

/**
 * Dashboard Widget Configuration
 */
export const WIDGET_CONFIGS = {
  [WIDGET_TYPES.NETWORK_STATS]: {
    title: 'Network Statistics',
    description: 'Overview of network connections and growth',
    icon: '📊',
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 2 }
  },
  [WIDGET_TYPES.MATCH_QUALITY]: {
    title: 'Match Quality Analysis',
    description: 'Distribution of match scores and quality metrics',
    icon: '🎯',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 }
  },
  [WIDGET_TYPES.SKILL_GAPS]: {
    title: 'Skill Gap Analysis',
    description: 'Identify supply and demand imbalances',
    icon: '🔍',
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 }
  },
  [WIDGET_TYPES.COMPANY_OVERVIEW]: {
    title: 'Company Overview',
    description: 'Company statistics and hiring activity',
    icon: '🏢',
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 3, height: 2 }
  },
  [WIDGET_TYPES.HIRING_TRENDS]: {
    title: 'Hiring Trends',
    description: 'Temporal analysis of hiring patterns',
    icon: '📈',
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 }
  },
  [WIDGET_TYPES.VISUALIZATION]: {
    title: 'Network Visualization',
    description: 'Interactive network graph',
    icon: '🌐',
    defaultSize: { width: 4, height: 3 },
    minSize: { width: 3, height: 2 },
    maxSize: { width: 4, height: 4 }
  },
  [WIDGET_TYPES.RECENT_ACTIVITY]: {
    title: 'Recent Activity',
    description: 'Latest matches and connections',
    icon: '⚡',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 3, height: 3 }
  },
  [WIDGET_TYPES.TOP_PERFORMERS]: {
    title: 'Top Performers',
    description: 'Highest scoring matches and entities',
    icon: '🏆',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 3, height: 3 }
  }
}

/**
 * Dashboard Widget Class
 */
export class DashboardWidget {
  constructor(type, config = {}) {
    this.id = config.id || `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.type = type
    this.title = config.title || WIDGET_CONFIGS[type]?.title || 'Untitled Widget'
    this.position = config.position || { x: 0, y: 0 }
    this.size = config.size || WIDGET_CONFIGS[type]?.defaultSize || { width: 2, height: 1 }
    this.settings = config.settings || {}
    this.data = config.data || null
    this.lastUpdated = config.lastUpdated || new Date()
    this.isVisible = config.isVisible !== undefined ? config.isVisible : true
  }

  /**
   * Update widget configuration
   */
  updateConfig(updates) {
    Object.assign(this, updates)
    this.lastUpdated = new Date()
  }

  /**
   * Update widget data
   */
  updateData(data) {
    this.data = data
    this.lastUpdated = new Date()
  }

  /**
   * Get widget configuration for serialization
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      position: this.position,
      size: this.size,
      settings: this.settings,
      data: this.data,
      lastUpdated: this.lastUpdated,
      isVisible: this.isVisible
    }
  }

  /**
   * Create widget from JSON
   */
  static fromJSON(json) {
    return new DashboardWidget(json.type, json)
  }
}

/**
 * Dashboard Class
 */
export class Dashboard {
  constructor(config = {}) {
    this.id = config.id || `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.name = config.name || 'Untitled Dashboard'
    this.description = config.description || ''
    this.widgets = new Map()
    this.layout = config.layout || { columns: 4, rows: 4 }
    this.theme = config.theme || 'light'
    this.isPublic = config.isPublic || false
    this.createdBy = config.createdBy || null
    this.createdAt = config.createdAt || new Date()
    this.lastModified = config.lastModified || new Date()

    // Load widgets if provided
    if (config.widgets) {
      config.widgets.forEach(widgetConfig => {
        const widget = DashboardWidget.fromJSON(widgetConfig)
        this.widgets.set(widget.id, widget)
      })
    }
  }

  /**
   * Add widget to dashboard
   */
  addWidget(type, config = {}) {
    // Find available position if not specified
    if (!config.position) {
      config.position = this.findAvailablePosition(
        config.size || WIDGET_CONFIGS[type]?.defaultSize || { width: 2, height: 1 }
      )
    }

    const widget = new DashboardWidget(type, config)
    this.widgets.set(widget.id, widget)
    this.lastModified = new Date()

    return widget.id
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(widgetId) {
    const removed = this.widgets.delete(widgetId)
    if (removed) {
      this.lastModified = new Date()
    }
    return removed
  }

  /**
   * Update widget
   */
  updateWidget(widgetId, updates) {
    const widget = this.widgets.get(widgetId)
    if (widget) {
      widget.updateConfig(updates)
      this.lastModified = new Date()
      return true
    }
    return false
  }

  /**
   * Get widget by ID
   */
  getWidget(widgetId) {
    return this.widgets.get(widgetId)
  }

  /**
   * Get all widgets
   */
  getWidgets() {
    return Array.from(this.widgets.values())
  }

  /**
   * Find available position for new widget
   */
  findAvailablePosition(size) {
    const occupiedPositions = new Set()
    
    // Mark all occupied positions
    this.widgets.forEach(widget => {
      if (!widget.isVisible) return
      
      for (let x = widget.position.x; x < widget.position.x + widget.size.width; x++) {
        for (let y = widget.position.y; y < widget.position.y + widget.size.height; y++) {
          occupiedPositions.add(`${x},${y}`)
        }
      }
    })

    // Find first available position
    for (let y = 0; y <= this.layout.rows - size.height; y++) {
      for (let x = 0; x <= this.layout.columns - size.width; x++) {
        let canPlace = true
        
        for (let dx = 0; dx < size.width && canPlace; dx++) {
          for (let dy = 0; dy < size.height && canPlace; dy++) {
            if (occupiedPositions.has(`${x + dx},${y + dy}`)) {
              canPlace = false
            }
          }
        }
        
        if (canPlace) {
          return { x, y }
        }
      }
    }

    // If no space found, place at origin (will overlap)
    return { x: 0, y: 0 }
  }

  /**
   * Validate widget position and size
   */
  validateWidgetPlacement(widgetId, position, size) {
    // Check bounds
    if (position.x < 0 || position.y < 0) return false
    if (position.x + size.width > this.layout.columns) return false
    if (position.y + size.height > this.layout.rows) return false

    // Check for overlaps with other widgets
    const occupiedPositions = new Set()
    
    this.widgets.forEach(widget => {
      if (widget.id === widgetId || !widget.isVisible) return
      
      for (let x = widget.position.x; x < widget.position.x + widget.size.width; x++) {
        for (let y = widget.position.y; y < widget.position.y + widget.size.height; y++) {
          occupiedPositions.add(`${x},${y}`)
        }
      }
    })

    for (let x = position.x; x < position.x + size.width; x++) {
      for (let y = position.y; y < position.y + size.height; y++) {
        if (occupiedPositions.has(`${x},${y}`)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Get dashboard statistics
   */
  getStats() {
    const widgets = this.getWidgets()
    const visibleWidgets = widgets.filter(w => w.isVisible)
    
    return {
      totalWidgets: widgets.length,
      visibleWidgets: visibleWidgets.length,
      widgetTypes: [...new Set(widgets.map(w => w.type))],
      lastModified: this.lastModified,
      createdAt: this.createdAt
    }
  }

  /**
   * Export dashboard configuration
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      widgets: this.getWidgets().map(w => w.toJSON()),
      layout: this.layout,
      theme: this.theme,
      isPublic: this.isPublic,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      lastModified: this.lastModified
    }
  }

  /**
   * Create dashboard from JSON
   */
  static fromJSON(json) {
    return new Dashboard(json)
  }
}

/**
 * Dashboard Manager Class
 */
export class DashboardManager {
  constructor() {
    this.dashboards = new Map()
    this.currentDashboard = null
    this.storageKey = 'candid_connections_dashboards'
  }

  /**
   * Create new dashboard
   */
  createDashboard(name, description = '', userId = null) {
    const dashboard = new Dashboard({
      name,
      description,
      createdBy: userId
    })

    this.dashboards.set(dashboard.id, dashboard)
    this.saveDashboards()

    return dashboard
  }

  /**
   * Get dashboard by ID
   */
  getDashboard(dashboardId) {
    return this.dashboards.get(dashboardId)
  }

  /**
   * Get all dashboards
   */
  getDashboards(userId = null) {
    const dashboards = Array.from(this.dashboards.values())
    
    if (userId) {
      return dashboards.filter(d => d.createdBy === userId || d.isPublic)
    }
    
    return dashboards
  }

  /**
   * Update dashboard
   */
  updateDashboard(dashboardId, updates) {
    const dashboard = this.dashboards.get(dashboardId)
    if (dashboard) {
      Object.assign(dashboard, updates)
      dashboard.lastModified = new Date()
      this.saveDashboards()
      return true
    }
    return false
  }

  /**
   * Delete dashboard
   */
  deleteDashboard(dashboardId) {
    const deleted = this.dashboards.delete(dashboardId)
    if (deleted) {
      if (this.currentDashboard?.id === dashboardId) {
        this.currentDashboard = null
      }
      this.saveDashboards()
    }
    return deleted
  }

  /**
   * Set current dashboard
   */
  setCurrentDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId)
    if (dashboard) {
      this.currentDashboard = dashboard
      return true
    }
    return false
  }

  /**
   * Get current dashboard
   */
  getCurrentDashboard() {
    return this.currentDashboard
  }

  /**
   * Save dashboards to localStorage
   */
  saveDashboards() {
    try {
      const dashboardsData = Array.from(this.dashboards.values()).map(d => d.toJSON())
      localStorage.setItem(this.storageKey, JSON.stringify(dashboardsData))
    } catch (error) {
      console.error('Failed to save dashboards:', error)
    }
  }

  /**
   * Load dashboards from localStorage
   */
  loadDashboards() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const dashboardsData = JSON.parse(stored)
        dashboardsData.forEach(data => {
          const dashboard = Dashboard.fromJSON(data)
          this.dashboards.set(dashboard.id, dashboard)
        })
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    }
  }

  /**
   * Create default dashboard
   */
  createDefaultDashboard(userId = null) {
    const dashboard = this.createDashboard('My Dashboard', 'Default analytics dashboard', userId)
    
    // Add default widgets
    dashboard.addWidget(WIDGET_TYPES.NETWORK_STATS, { position: { x: 0, y: 0 } })
    dashboard.addWidget(WIDGET_TYPES.MATCH_QUALITY, { position: { x: 2, y: 0 } })
    dashboard.addWidget(WIDGET_TYPES.RECENT_ACTIVITY, { position: { x: 0, y: 1 } })
    dashboard.addWidget(WIDGET_TYPES.TOP_PERFORMERS, { position: { x: 2, y: 1 } })

    this.saveDashboards()
    return dashboard
  }
}

// Global dashboard manager instance
export const dashboardManager = new DashboardManager()

// Load existing dashboards on initialization
dashboardManager.loadDashboards()

export default {
  WIDGET_TYPES,
  WIDGET_CONFIGS,
  DashboardWidget,
  Dashboard,
  DashboardManager,
  dashboardManager
}
