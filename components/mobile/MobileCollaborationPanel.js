// Mobile-Optimized Collaboration Panel
// Touch-friendly collaboration interface for mobile devices

import { useState, useEffect, useRef } from 'react'
import { collaborationManager } from '../../lib/collaborationSystem'
import { MobileResponsiveUtils } from '../../lib/mobileVisualizationControls'

export default function MobileCollaborationPanel({
  visualizationState = {},
  onStateChange = () => {},
  className = ''
}) {
  const [session, setSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [annotations, setAnnotations] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('session')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [sessionForm, setSessionForm] = useState({ sessionId: '', userName: '' })

  // Mobile-specific state
  const [touchAnnotation, setTouchAnnotation] = useState({ x: 0, y: 0, text: '' })
  const [showAnnotationInput, setShowAnnotationInput] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const panelRef = useRef(null)
  const isMobile = MobileResponsiveUtils.isMobile()
  const userId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`).current

  useEffect(() => {
    const currentSession = collaborationManager.getCurrentSession()
    if (currentSession) {
      setSession(currentSession)
      updateSessionData(currentSession)
      setupSessionListeners(currentSession)
    }
  }, [])

  useEffect(() => {
    if (isMobile && panelRef.current) {
      // Add touch event listeners for dragging
      const panel = panelRef.current
      panel.addEventListener('touchstart', handlePanelTouchStart, { passive: false })
      panel.addEventListener('touchmove', handlePanelTouchMove, { passive: false })
      panel.addEventListener('touchend', handlePanelTouchEnd, { passive: false })

      return () => {
        panel.removeEventListener('touchstart', handlePanelTouchStart)
        panel.removeEventListener('touchmove', handlePanelTouchMove)
        panel.removeEventListener('touchend', handlePanelTouchEnd)
      }
    }
  }, [isMobile, isDragging])

  const handlePanelTouchStart = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true)
      const touch = e.touches[0]
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
    }
  }

  const handlePanelTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault()
      const touch = e.touches[0]
      const panel = panelRef.current
      
      panel.style.left = `${touch.clientX - dragOffset.x}px`
      panel.style.top = `${touch.clientY - dragOffset.y}px`
    }
  }

  const handlePanelTouchEnd = () => {
    setIsDragging(false)
  }

  const setupSessionListeners = (session) => {
    session.on('participantJoined', () => setParticipants(session.getParticipants()))
    session.on('participantLeft', () => setParticipants(session.getParticipants()))
    session.on('stateShared', (data) => onStateChange(data.state))
    session.on('annotationAdded', () => setAnnotations(session.getAnnotations()))
    session.on('annotationRemoved', () => setAnnotations(session.getAnnotations()))
    session.on('bookmarkCreated', () => setBookmarks(session.getBookmarks()))
    session.on('bookmarkLoaded', (data) => onStateChange(data.bookmark.state))
  }

  const updateSessionData = (session) => {
    setParticipants(session.getParticipants())
    setAnnotations(session.getAnnotations())
    setBookmarks(session.getBookmarks())
  }

  const handleCreateSession = async () => {
    if (!sessionForm.userName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsConnecting(true)
    try {
      const newSession = await collaborationManager.createSession(userId, sessionForm.userName.trim())
      if (newSession) {
        setSession(newSession)
        updateSessionData(newSession)
        setupSessionListeners(newSession)
        setShowJoinModal(false)
      }
    } catch (error) {
      alert('Failed to create session')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleJoinSession = async () => {
    if (!sessionForm.sessionId.trim() || !sessionForm.userName.trim()) {
      alert('Please enter session ID and your name')
      return
    }

    setIsConnecting(true)
    try {
      const joinedSession = await collaborationManager.joinSession(
        sessionForm.sessionId.trim(),
        userId,
        sessionForm.userName.trim()
      )
      if (joinedSession) {
        setSession(joinedSession)
        updateSessionData(joinedSession)
        setupSessionListeners(joinedSession)
        setShowJoinModal(false)
      } else {
        alert('Failed to join session')
      }
    } catch (error) {
      alert('Failed to join session')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTouchAnnotation = (e) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    setTouchAnnotation({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      text: ''
    })
    setShowAnnotationInput(true)
  }

  const handleAddTouchAnnotation = () => {
    if (session && touchAnnotation.text.trim()) {
      session.addAnnotation({
        text: touchAnnotation.text.trim(),
        x: touchAnnotation.x,
        y: touchAnnotation.y,
        type: 'touch'
      })
      setShowAnnotationInput(false)
      setTouchAnnotation({ x: 0, y: 0, text: '' })
    }
  }

  const handleShareState = () => {
    if (session && visualizationState) {
      session.shareVisualizationState(visualizationState)
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const copySessionId = () => {
    if (session) {
      navigator.clipboard.writeText(session.sessionId)
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
      alert('Session ID copied!')
    }
  }

  // Compact mobile view when not expanded
  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center space-x-1">
            <span>👥</span>
            {session && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className={`fixed bottom-4 right-4 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}
      style={{ maxHeight: '70vh' }}
    >
      {/* Mobile Header with Drag Handle */}
      <div className="drag-handle flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move">
        <div className="flex items-center space-x-2">
          <span className="text-lg">👥</span>
          <h3 className="font-medium text-gray-900">Collaboration</h3>
          {session && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-gray-400 rounded"></div>
            <div className="w-1 h-4 bg-gray-400 rounded"></div>
            <div className="w-1 h-4 bg-gray-400 rounded"></div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {!session ? (
        /* Session Setup */
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🤝</div>
            <h4 className="font-medium text-gray-900">Start Collaborating</h4>
            <p className="text-sm text-gray-600">Work together in real-time</p>
          </div>
          
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            🚀 Start Session
          </button>
        </div>
      ) : (
        /* Active Session */
        <>
          {/* Session Info */}
          <div className="p-3 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Session: {session.sessionId.slice(-6)}
                </div>
                <div className="text-xs text-blue-700">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={copySessionId}
                  className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded"
                >
                  📋
                </button>
                <button
                  onClick={handleShareState}
                  className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded"
                >
                  📤
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'session', label: '👥', title: 'Participants' },
              { id: 'annotations', label: '📝', title: 'Notes' },
              { id: 'bookmarks', label: '🔖', title: 'Bookmarks' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">{tab.label}</div>
                  <div className="text-xs">{tab.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3 max-h-48 overflow-y-auto">
            {activeTab === 'session' && (
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium flex-1">{participant.name}</span>
                    {participant.id === userId && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">You</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'annotations' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAnnotationInput(true)}
                  className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700"
                >
                  ➕ Add Note
                </button>
                <div className="space-y-2">
                  {annotations.map(annotation => (
                    <div key={annotation.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <div className="font-medium">{annotation.text}</div>
                      <div className="text-xs text-gray-500">
                        by {annotation.authorName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const name = prompt('Bookmark name:')
                    if (name && session) {
                      session.createBookmark(name.trim())
                    }
                  }}
                  className="w-full bg-green-600 text-white px-3 py-2 text-sm rounded hover:bg-green-700"
                >
                  🔖 Save View
                </button>
                <div className="space-y-2">
                  {bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{bookmark.name}</div>
                        <button
                          onClick={() => session.loadBookmark(bookmark.id)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Join Collaboration</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={sessionForm.userName}
                onChange={(e) => setSessionForm({ ...sessionForm, userName: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              
              <div className="space-y-3">
                <button
                  onClick={handleCreateSession}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isConnecting ? 'Creating...' : '🚀 Create New Session'}
                </button>
                
                <div className="text-center text-sm text-gray-500">or</div>
                
                <input
                  type="text"
                  value={sessionForm.sessionId}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionId: e.target.value })}
                  placeholder="Session ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                
                <button
                  onClick={handleJoinSession}
                  disabled={isConnecting}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isConnecting ? 'Joining...' : '🔗 Join Session'}
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch Annotation Input */}
      {showAnnotationInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-3">Add Note</h3>
              <textarea
                value={touchAnnotation.text}
                onChange={(e) => setTouchAnnotation({ ...touchAnnotation, text: e.target.value })}
                placeholder="Enter your note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={handleAddTouchAnnotation}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Note
                </button>
                <button
                  onClick={() => setShowAnnotationInput(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
