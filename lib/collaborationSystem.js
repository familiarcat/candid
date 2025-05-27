// Real-time Collaboration System for Candid Connections
// Enables multi-user visualization sessions, annotations, and shared exploration

import { EventEmitter } from 'events'

/**
 * Collaboration Session Manager
 * Handles real-time collaboration features
 */
export class CollaborationSession extends EventEmitter {
  constructor(sessionId, userId, userName) {
    super()
    this.sessionId = sessionId
    this.userId = userId
    this.userName = userName
    this.participants = new Map()
    this.annotations = new Map()
    this.bookmarks = new Map()
    this.currentState = null
    this.isHost = false
    this.connected = false
  }

  /**
   * Initialize collaboration session
   */
  async initialize() {
    try {
      // In a real implementation, this would connect to WebSocket server
      // For now, we'll simulate with localStorage for demo purposes
      this.connected = true
      this.emit('connected', { sessionId: this.sessionId })
      
      // Load existing session data
      await this.loadSessionData()
      
      return true
    } catch (error) {
      console.error('Failed to initialize collaboration session:', error)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Join existing session
   */
  async joinSession(sessionId) {
    try {
      this.sessionId = sessionId
      await this.initialize()
      
      // Add self to participants
      this.participants.set(this.userId, {
        id: this.userId,
        name: this.userName,
        joinedAt: new Date(),
        cursor: null,
        activeNode: null
      })
      
      this.emit('participantJoined', {
        participant: this.participants.get(this.userId),
        totalParticipants: this.participants.size
      })
      
      return true
    } catch (error) {
      console.error('Failed to join session:', error)
      return false
    }
  }

  /**
   * Create new collaboration session
   */
  async createSession() {
    try {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.isHost = true
      
      await this.initialize()
      await this.joinSession(this.sessionId)
      
      return this.sessionId
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }

  /**
   * Share current visualization state
   */
  shareVisualizationState(state) {
    if (!this.connected) return false
    
    this.currentState = {
      ...state,
      timestamp: Date.now(),
      sharedBy: this.userId
    }
    
    // Store in localStorage for demo (would be WebSocket in production)
    this.saveSessionData()
    
    this.emit('stateShared', {
      state: this.currentState,
      sharedBy: this.userName
    })
    
    return true
  }

  /**
   * Add annotation to visualization
   */
  addAnnotation(annotation) {
    const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const fullAnnotation = {
      id: annotationId,
      ...annotation,
      authorId: this.userId,
      authorName: this.userName,
      createdAt: new Date(),
      sessionId: this.sessionId
    }
    
    this.annotations.set(annotationId, fullAnnotation)
    this.saveSessionData()
    
    this.emit('annotationAdded', fullAnnotation)
    
    return annotationId
  }

  /**
   * Remove annotation
   */
  removeAnnotation(annotationId) {
    if (!this.annotations.has(annotationId)) return false
    
    const annotation = this.annotations.get(annotationId)
    
    // Only author or host can remove annotations
    if (annotation.authorId !== this.userId && !this.isHost) {
      return false
    }
    
    this.annotations.delete(annotationId)
    this.saveSessionData()
    
    this.emit('annotationRemoved', { annotationId, removedBy: this.userId })
    
    return true
  }

  /**
   * Create bookmark for current state
   */
  createBookmark(name, description = '') {
    if (!this.currentState) return null
    
    const bookmarkId = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const bookmark = {
      id: bookmarkId,
      name,
      description,
      state: { ...this.currentState },
      createdBy: this.userId,
      createdByName: this.userName,
      createdAt: new Date(),
      sessionId: this.sessionId
    }
    
    this.bookmarks.set(bookmarkId, bookmark)
    this.saveSessionData()
    
    this.emit('bookmarkCreated', bookmark)
    
    return bookmarkId
  }

  /**
   * Load bookmark state
   */
  loadBookmark(bookmarkId) {
    if (!this.bookmarks.has(bookmarkId)) return false
    
    const bookmark = this.bookmarks.get(bookmarkId)
    this.shareVisualizationState(bookmark.state)
    
    this.emit('bookmarkLoaded', {
      bookmark,
      loadedBy: this.userId
    })
    
    return true
  }

  /**
   * Update participant cursor position
   */
  updateCursor(position) {
    if (!this.participants.has(this.userId)) return false
    
    const participant = this.participants.get(this.userId)
    participant.cursor = position
    participant.lastActivity = new Date()
    
    this.emit('cursorUpdated', {
      userId: this.userId,
      position,
      participant
    })
    
    return true
  }

  /**
   * Set active node for participant
   */
  setActiveNode(nodeId, nodeData = null) {
    if (!this.participants.has(this.userId)) return false
    
    const participant = this.participants.get(this.userId)
    participant.activeNode = { id: nodeId, data: nodeData }
    participant.lastActivity = new Date()
    
    this.emit('activeNodeChanged', {
      userId: this.userId,
      nodeId,
      nodeData,
      participant
    })
    
    return true
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      participantCount: this.participants.size,
      annotationCount: this.annotations.size,
      bookmarkCount: this.bookmarks.size,
      isHost: this.isHost,
      connected: this.connected,
      currentState: this.currentState ? 'Available' : 'None'
    }
  }

  /**
   * Get all participants
   */
  getParticipants() {
    return Array.from(this.participants.values())
  }

  /**
   * Get all annotations
   */
  getAnnotations() {
    return Array.from(this.annotations.values())
  }

  /**
   * Get all bookmarks
   */
  getBookmarks() {
    return Array.from(this.bookmarks.values())
  }

  /**
   * Leave session
   */
  leaveSession() {
    if (this.participants.has(this.userId)) {
      this.participants.delete(this.userId)
      
      this.emit('participantLeft', {
        userId: this.userId,
        userName: this.userName,
        remainingParticipants: this.participants.size
      })
    }
    
    this.connected = false
    this.removeAllListeners()
  }

  /**
   * Save session data to localStorage (demo implementation)
   */
  saveSessionData() {
    if (!this.sessionId) return
    
    const sessionData = {
      sessionId: this.sessionId,
      participants: Array.from(this.participants.entries()),
      annotations: Array.from(this.annotations.entries()),
      bookmarks: Array.from(this.bookmarks.entries()),
      currentState: this.currentState,
      lastUpdated: new Date()
    }
    
    localStorage.setItem(`collaboration_${this.sessionId}`, JSON.stringify(sessionData))
  }

  /**
   * Load session data from localStorage (demo implementation)
   */
  async loadSessionData() {
    if (!this.sessionId) return
    
    const stored = localStorage.getItem(`collaboration_${this.sessionId}`)
    if (!stored) return
    
    try {
      const sessionData = JSON.parse(stored)
      
      this.participants = new Map(sessionData.participants || [])
      this.annotations = new Map(sessionData.annotations || [])
      this.bookmarks = new Map(sessionData.bookmarks || [])
      this.currentState = sessionData.currentState
      
      this.emit('sessionDataLoaded', {
        participantCount: this.participants.size,
        annotationCount: this.annotations.size,
        bookmarkCount: this.bookmarks.size
      })
    } catch (error) {
      console.error('Failed to load session data:', error)
    }
  }
}

/**
 * Global collaboration manager
 */
export class CollaborationManager {
  constructor() {
    this.currentSession = null
    this.availableSessions = new Map()
  }

  /**
   * Create new collaboration session
   */
  async createSession(userId, userName) {
    const session = new CollaborationSession(null, userId, userName)
    const sessionId = await session.createSession()
    
    if (sessionId) {
      this.currentSession = session
      this.availableSessions.set(sessionId, session)
      return session
    }
    
    return null
  }

  /**
   * Join existing session
   */
  async joinSession(sessionId, userId, userName) {
    const session = new CollaborationSession(sessionId, userId, userName)
    const success = await session.joinSession(sessionId)
    
    if (success) {
      this.currentSession = session
      this.availableSessions.set(sessionId, session)
      return session
    }
    
    return null
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession
  }

  /**
   * Leave current session
   */
  leaveCurrentSession() {
    if (this.currentSession) {
      this.currentSession.leaveSession()
      this.availableSessions.delete(this.currentSession.sessionId)
      this.currentSession = null
    }
  }

  /**
   * Check if in collaboration session
   */
  isInSession() {
    return this.currentSession && this.currentSession.connected
  }
}

// Global collaboration manager instance
export const collaborationManager = new CollaborationManager()

export default {
  CollaborationSession,
  CollaborationManager,
  collaborationManager
}
