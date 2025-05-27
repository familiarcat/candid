// Comprehensive Testing Framework for Enterprise Features
// Tests collaboration, dashboards, analytics, and integration

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { CollaborationSession, collaborationManager } from '../lib/collaborationSystem'
import { Dashboard, dashboardManager, WIDGET_TYPES } from '../lib/dashboardSystem'
import { AdvancedAnalytics, advancedAnalytics } from '../lib/advancedAnalytics'

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

describe('Enterprise Features Test Suite', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    // Clean up after each test
    collaborationManager.leaveCurrentSession()
    dashboardManager.dashboards.clear()
  })

  describe('Collaboration System', () => {
    test('should create collaboration session successfully', async () => {
      const session = new CollaborationSession(null, 'user1', 'Test User')
      const sessionId = await session.createSession()
      
      expect(sessionId).toBeTruthy()
      expect(session.sessionId).toBe(sessionId)
      expect(session.isHost).toBe(true)
      expect(session.connected).toBe(true)
    })

    test('should join existing session', async () => {
      const hostSession = new CollaborationSession(null, 'host', 'Host User')
      const sessionId = await hostSession.createSession()
      
      const guestSession = new CollaborationSession(sessionId, 'guest', 'Guest User')
      const success = await guestSession.joinSession(sessionId)
      
      expect(success).toBe(true)
      expect(guestSession.sessionId).toBe(sessionId)
      expect(guestSession.isHost).toBe(false)
    })

    test('should share visualization state', () => {
      const session = new CollaborationSession('test-session', 'user1', 'Test User')
      session.connected = true
      
      const testState = { nodes: [], links: [], camera: { x: 0, y: 0, z: 10 } }
      const result = session.shareVisualizationState(testState)
      
      expect(result).toBe(true)
      expect(session.currentState).toMatchObject(testState)
      expect(session.currentState.sharedBy).toBe('user1')
    })

    test('should add and remove annotations', () => {
      const session = new CollaborationSession('test-session', 'user1', 'Test User')
      
      const annotationId = session.addAnnotation({
        text: 'Test annotation',
        x: 100,
        y: 200,
        type: 'note'
      })
      
      expect(annotationId).toBeTruthy()
      expect(session.annotations.size).toBe(1)
      
      const annotation = session.annotations.get(annotationId)
      expect(annotation.text).toBe('Test annotation')
      expect(annotation.authorId).toBe('user1')
      
      const removed = session.removeAnnotation(annotationId)
      expect(removed).toBe(true)
      expect(session.annotations.size).toBe(0)
    })

    test('should create and load bookmarks', () => {
      const session = new CollaborationSession('test-session', 'user1', 'Test User')
      session.currentState = { test: 'state' }
      
      const bookmarkId = session.createBookmark('Test Bookmark', 'Test description')
      
      expect(bookmarkId).toBeTruthy()
      expect(session.bookmarks.size).toBe(1)
      
      const bookmark = session.bookmarks.get(bookmarkId)
      expect(bookmark.name).toBe('Test Bookmark')
      expect(bookmark.state).toMatchObject({ test: 'state' })
      
      // Clear current state and load bookmark
      session.currentState = null
      const loaded = session.loadBookmark(bookmarkId)
      
      expect(loaded).toBe(true)
      expect(session.currentState).toMatchObject({ test: 'state' })
    })

    test('should manage collaboration manager', async () => {
      const session = await collaborationManager.createSession('user1', 'Test User')
      
      expect(session).toBeTruthy()
      expect(collaborationManager.getCurrentSession()).toBe(session)
      expect(collaborationManager.isInSession()).toBe(true)
      
      collaborationManager.leaveCurrentSession()
      expect(collaborationManager.getCurrentSession()).toBeNull()
      expect(collaborationManager.isInSession()).toBe(false)
    })
  })

  describe('Dashboard System', () => {
    test('should create dashboard with default widgets', () => {
      const dashboard = new Dashboard({
        name: 'Test Dashboard',
        description: 'Test description'
      })
      
      expect(dashboard.name).toBe('Test Dashboard')
      expect(dashboard.description).toBe('Test description')
      expect(dashboard.layout.columns).toBe(4)
      expect(dashboard.layout.rows).toBe(4)
    })

    test('should add and remove widgets', () => {
      const dashboard = new Dashboard()
      
      const widgetId = dashboard.addWidget(WIDGET_TYPES.NETWORK_STATS)
      expect(widgetId).toBeTruthy()
      expect(dashboard.widgets.size).toBe(1)
      
      const widget = dashboard.getWidget(widgetId)
      expect(widget.type).toBe(WIDGET_TYPES.NETWORK_STATS)
      expect(widget.position).toEqual({ x: 0, y: 0 })
      
      const removed = dashboard.removeWidget(widgetId)
      expect(removed).toBe(true)
      expect(dashboard.widgets.size).toBe(0)
    })

    test('should validate widget placement', () => {
      const dashboard = new Dashboard()
      
      // Add first widget
      const widget1Id = dashboard.addWidget(WIDGET_TYPES.NETWORK_STATS, {
        position: { x: 0, y: 0 },
        size: { width: 2, height: 1 }
      })
      
      // Test valid placement
      const validPlacement = dashboard.validateWidgetPlacement(
        'new-widget',
        { x: 2, y: 0 },
        { width: 2, height: 1 }
      )
      expect(validPlacement).toBe(true)
      
      // Test invalid placement (overlap)
      const invalidPlacement = dashboard.validateWidgetPlacement(
        'new-widget',
        { x: 0, y: 0 },
        { width: 2, height: 1 }
      )
      expect(invalidPlacement).toBe(false)
    })

    test('should find available positions', () => {
      const dashboard = new Dashboard()
      
      // Add widget at origin
      dashboard.addWidget(WIDGET_TYPES.NETWORK_STATS, {
        position: { x: 0, y: 0 },
        size: { width: 2, height: 1 }
      })
      
      // Find next available position
      const position = dashboard.findAvailablePosition({ width: 2, height: 1 })
      expect(position).toEqual({ x: 2, y: 0 })
    })

    test('should manage dashboard collection', () => {
      const dashboard1 = dashboardManager.createDashboard('Dashboard 1', 'First dashboard', 'user1')
      const dashboard2 = dashboardManager.createDashboard('Dashboard 2', 'Second dashboard', 'user1')
      
      expect(dashboard1).toBeTruthy()
      expect(dashboard2).toBeTruthy()
      
      const dashboards = dashboardManager.getDashboards('user1')
      expect(dashboards).toHaveLength(2)
      
      dashboardManager.setCurrentDashboard(dashboard1.id)
      expect(dashboardManager.getCurrentDashboard()).toBe(dashboard1)
      
      const deleted = dashboardManager.deleteDashboard(dashboard2.id)
      expect(deleted).toBe(true)
      expect(dashboardManager.getDashboards('user1')).toHaveLength(1)
    })

    test('should create default dashboard', () => {
      const dashboard = dashboardManager.createDefaultDashboard('user1')
      
      expect(dashboard.name).toBe('My Dashboard')
      expect(dashboard.getWidgets()).toHaveLength(4) // Default widgets
      
      const widgetTypes = dashboard.getWidgets().map(w => w.type)
      expect(widgetTypes).toContain(WIDGET_TYPES.NETWORK_STATS)
      expect(widgetTypes).toContain(WIDGET_TYPES.MATCH_QUALITY)
      expect(widgetTypes).toContain(WIDGET_TYPES.RECENT_ACTIVITY)
      expect(widgetTypes).toContain(WIDGET_TYPES.TOP_PERFORMERS)
    })
  })

  describe('Advanced Analytics', () => {
    const mockNetworkData = {
      nodes: [
        { id: 'js1', type: 'jobSeeker', name: 'John Doe', skills: ['JavaScript', 'React'] },
        { id: 'js2', type: 'jobSeeker', name: 'Jane Smith', skills: ['Python', 'Django'] },
        { id: 'auth1', type: 'authority', name: 'Tech Lead', skillsLookingFor: ['JavaScript', 'React'] },
        { id: 'auth2', type: 'authority', name: 'Backend Lead', skillsLookingFor: ['Python', 'Node.js'] }
      ],
      links: [
        { source: { id: 'js1' }, target: { id: 'auth1' } },
        { source: { id: 'js2' }, target: { id: 'auth2' } }
      ]
    }

    test('should generate predictive insights', () => {
      const insights = advancedAnalytics.generatePredictiveInsights(mockNetworkData)
      
      expect(insights).toHaveProperty('matchPredictions')
      expect(insights).toHaveProperty('networkGrowth')
      expect(insights).toHaveProperty('skillDemandForecast')
      expect(insights).toHaveProperty('hiringTrends')
      expect(insights).toHaveProperty('riskAssessment')
    })

    test('should predict future matches', () => {
      const predictions = advancedAnalytics.predictFutureMatches(mockNetworkData)
      
      expect(Array.isArray(predictions)).toBe(true)
      
      if (predictions.length > 0) {
        const prediction = predictions[0]
        expect(prediction).toHaveProperty('jobSeeker')
        expect(prediction).toHaveProperty('authority')
        expect(prediction).toHaveProperty('probability')
        expect(prediction).toHaveProperty('confidence')
        expect(prediction).toHaveProperty('factors')
        expect(prediction).toHaveProperty('estimatedTimeToMatch')
        expect(prediction).toHaveProperty('recommendedActions')
        
        expect(prediction.probability).toBeGreaterThanOrEqual(0)
        expect(prediction.probability).toBeLessThanOrEqual(1)
      }
    })

    test('should calculate match probability', () => {
      const jobSeeker = mockNetworkData.nodes[0]
      const authority = mockNetworkData.nodes[2]
      
      const probability = advancedAnalytics.calculateMatchProbability(
        jobSeeker,
        authority,
        mockNetworkData
      )
      
      expect(probability).toBeGreaterThanOrEqual(0)
      expect(probability).toBeLessThanOrEqual(1)
    })

    test('should calculate skill alignment', () => {
      const jobSeeker = { skills: ['JavaScript', 'React', 'Node.js'] }
      const authority = { skillsLookingFor: ['JavaScript', 'React'] }
      
      const alignment = advancedAnalytics.calculateSkillAlignment(jobSeeker, authority)
      
      expect(alignment).toBeGreaterThan(0)
      expect(alignment).toBeLessThanOrEqual(1)
    })

    test('should detect network anomalies', () => {
      const anomalies = advancedAnalytics.detectAnomalies(mockNetworkData)
      
      expect(Array.isArray(anomalies)).toBe(true)
      
      anomalies.forEach(anomaly => {
        expect(anomaly).toHaveProperty('type')
        expect(anomaly).toHaveProperty('entity')
        expect(anomaly).toHaveProperty('severity')
        expect(anomaly).toHaveProperty('description')
      })
    })

    test('should calculate network health', () => {
      const health = advancedAnalytics.calculateNetworkHealth(mockNetworkData)
      
      expect(health).toHaveProperty('overall')
      expect(health).toHaveProperty('metrics')
      expect(health).toHaveProperty('recommendations')
      expect(health).toHaveProperty('alerts')
      
      expect(health.overall).toBeGreaterThanOrEqual(0)
      expect(health.overall).toBeLessThanOrEqual(1)
      
      expect(health.metrics).toHaveProperty('connectivity')
      expect(health.metrics).toHaveProperty('diversity')
      expect(health.metrics).toHaveProperty('efficiency')
      expect(health.metrics).toHaveProperty('resilience')
    })

    test('should generate recommendations', () => {
      const recommendations = advancedAnalytics.generateRecommendations(
        mockNetworkData,
        'jobSeeker',
        'js1'
      )
      
      expect(Array.isArray(recommendations)).toBe(true)
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type')
        expect(rec).toHaveProperty('priority')
        expect(rec).toHaveProperty('title')
        expect(rec).toHaveProperty('description')
      })
    })
  })

  describe('Integration Tests', () => {
    test('should integrate collaboration with analytics', async () => {
      const session = await collaborationManager.createSession('user1', 'Test User')
      
      const mockState = {
        networkData: {
          nodes: [{ id: 'test', type: 'jobSeeker' }],
          links: []
        }
      }
      
      session.shareVisualizationState(mockState)
      
      const insights = advancedAnalytics.generatePredictiveInsights(mockState.networkData)
      
      expect(session.currentState).toMatchObject(mockState)
      expect(insights).toHaveProperty('matchPredictions')
    })

    test('should integrate dashboard with analytics data', () => {
      const dashboard = dashboardManager.createDefaultDashboard('user1')
      const analyticsWidget = dashboard.getWidgets().find(w => w.type === WIDGET_TYPES.NETWORK_STATS)
      
      expect(analyticsWidget).toBeTruthy()
      expect(analyticsWidget.type).toBe(WIDGET_TYPES.NETWORK_STATS)
      
      // Simulate updating widget with analytics data
      const mockAnalyticsData = {
        totalNodes: 100,
        totalConnections: 250,
        networkHealth: 0.85
      }
      
      analyticsWidget.updateData(mockAnalyticsData)
      
      expect(analyticsWidget.data).toMatchObject(mockAnalyticsData)
      expect(analyticsWidget.lastUpdated).toBeInstanceOf(Date)
    })

    test('should handle localStorage persistence', () => {
      const dashboard = dashboardManager.createDashboard('Test Dashboard', '', 'user1')
      
      // Mock localStorage.setItem to capture the saved data
      let savedData = null
      localStorageMock.setItem.mockImplementation((key, value) => {
        savedData = { key, value }
      })
      
      dashboardManager.saveDashboards()
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
      expect(savedData.key).toBe('candid_connections_dashboards')
      
      const parsedData = JSON.parse(savedData.value)
      expect(Array.isArray(parsedData)).toBe(true)
      expect(parsedData[0].name).toBe('Test Dashboard')
    })
  })

  describe('Error Handling', () => {
    test('should handle collaboration session errors gracefully', async () => {
      const session = new CollaborationSession(null, 'user1', 'Test User')
      
      // Test invalid session join
      const result = await session.joinSession('invalid-session-id')
      expect(result).toBe(true) // Should still succeed with localStorage mock
    })

    test('should handle dashboard validation errors', () => {
      const dashboard = new Dashboard()
      
      // Test invalid widget placement
      const result = dashboard.validateWidgetPlacement(
        'test-widget',
        { x: -1, y: -1 }, // Invalid negative position
        { width: 2, height: 1 }
      )
      
      expect(result).toBe(false)
    })

    test('should handle analytics with empty data', () => {
      const emptyNetworkData = { nodes: [], links: [] }
      
      const insights = advancedAnalytics.generatePredictiveInsights(emptyNetworkData)
      
      expect(insights).toHaveProperty('matchPredictions')
      expect(insights.matchPredictions).toHaveLength(0)
    })
  })
})

// Performance Tests
describe('Performance Tests', () => {
  test('should handle large datasets efficiently', () => {
    const startTime = Date.now()
    
    // Create large network data
    const largeNetworkData = {
      nodes: Array.from({ length: 1000 }, (_, i) => ({
        id: `node${i}`,
        type: i % 2 === 0 ? 'jobSeeker' : 'authority',
        name: `Entity ${i}`
      })),
      links: Array.from({ length: 500 }, (_, i) => ({
        source: { id: `node${i}` },
        target: { id: `node${i + 500}` }
      }))
    }
    
    const insights = advancedAnalytics.generatePredictiveInsights(largeNetworkData)
    
    const endTime = Date.now()
    const executionTime = endTime - startTime
    
    expect(insights).toHaveProperty('matchPredictions')
    expect(executionTime).toBeLessThan(5000) // Should complete within 5 seconds
  })

  test('should handle multiple concurrent dashboard operations', () => {
    const startTime = Date.now()
    
    // Create multiple dashboards concurrently
    const dashboards = Array.from({ length: 10 }, (_, i) => 
      dashboardManager.createDashboard(`Dashboard ${i}`, '', 'user1')
    )
    
    // Add widgets to each dashboard
    dashboards.forEach(dashboard => {
      Object.values(WIDGET_TYPES).forEach(widgetType => {
        dashboard.addWidget(widgetType)
      })
    })
    
    const endTime = Date.now()
    const executionTime = endTime - startTime
    
    expect(dashboards).toHaveLength(10)
    expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
  })
})
