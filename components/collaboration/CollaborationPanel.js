// Collaboration Panel Component for Real-time Collaboration
// Provides UI for session management, participants, annotations, and bookmarks

import { useState, useEffect, useRef } from 'react'
import { collaborationManager } from '../../lib/collaborationSystem'

export default function CollaborationPanel({
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
  const [newAnnotation, setNewAnnotation] = useState({ text: '', x: 0, y: 0 })
  const [newBookmark, setNewBookmark] = useState({ name: '', description: '' })
  const [sessionId, setSessionId] = useState('')
  const [userName, setUserName] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  // Generate user ID (in production, this would come from authentication)
  const userId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`).current

  useEffect(() => {
    const currentSession = collaborationManager.getCurrentSession()
    if (currentSession) {
      setSession(currentSession)
      updateSessionData(currentSession)
      setupSessionListeners(currentSession)
    }
  }, [])

  const setupSessionListeners = (session) => {
    session.on('participantJoined', (data) => {
      setParticipants(session.getParticipants())
    })

    session.on('participantLeft', (data) => {
      setParticipants(session.getParticipants())
    })

    session.on('stateShared', (data) => {
      onStateChange(data.state)
    })

    session.on('annotationAdded', (annotation) => {
      setAnnotations(session.getAnnotations())
    })

    session.on('annotationRemoved', (data) => {
      setAnnotations(session.getAnnotations())
    })

    session.on('bookmarkCreated', (bookmark) => {
      setBookmarks(session.getBookmarks())
    })

    session.on('bookmarkLoaded', (data) => {
      onStateChange(data.bookmark.state)
    })
  }

  const updateSessionData = (session) => {
    setParticipants(session.getParticipants())
    setAnnotations(session.getAnnotations())
    setBookmarks(session.getBookmarks())
  }

  const handleCreateSession = async () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsConnecting(true)
    try {
      const newSession = await collaborationManager.createSession(userId, userName.trim())
      if (newSession) {
        setSession(newSession)
        updateSessionData(newSession)
        setupSessionListeners(newSession)
        setSessionId(newSession.sessionId)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Failed to create collaboration session')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleJoinSession = async () => {
    if (!sessionId.trim() || !userName.trim()) {
      alert('Please enter session ID and your name')
      return
    }

    setIsConnecting(true)
    try {
      const joinedSession = await collaborationManager.joinSession(sessionId.trim(), userId, userName.trim())
      if (joinedSession) {
        setSession(joinedSession)
        updateSessionData(joinedSession)
        setupSessionListeners(joinedSession)
      } else {
        alert('Failed to join session. Please check the session ID.')
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      alert('Failed to join collaboration session')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLeaveSession = () => {
    if (session) {
      collaborationManager.leaveCurrentSession()
      setSession(null)
      setParticipants([])
      setAnnotations([])
      setBookmarks([])
      setSessionId('')
    }
  }

  const handleShareState = () => {
    if (session && visualizationState) {
      session.shareVisualizationState(visualizationState)
    }
  }

  const handleAddAnnotation = () => {
    if (session && newAnnotation.text.trim()) {
      session.addAnnotation({
        text: newAnnotation.text.trim(),
        x: newAnnotation.x,
        y: newAnnotation.y,
        type: 'note'
      })
      setNewAnnotation({ text: '', x: 0, y: 0 })
    }
  }

  const handleCreateBookmark = () => {
    if (session && newBookmark.name.trim()) {
      session.createBookmark(newBookmark.name.trim(), newBookmark.description.trim())
      setNewBookmark({ name: '', description: '' })
    }
  }

  const handleLoadBookmark = (bookmarkId) => {
    if (session) {
      session.loadBookmark(bookmarkId)
    }
  }

  const copySessionId = () => {
    if (session) {
      navigator.clipboard.writeText(session.sessionId)
      alert('Session ID copied to clipboard!')
    }
  }

  if (!isExpanded) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {session ? `Collaboration (${participants.length})` : 'Collaboration'}
            </span>
            {session && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            👥
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Collaboration</h3>
        <div className="flex items-center space-x-2">
          {session && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {!session ? (
        /* Session Setup */
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleCreateSession}
              disabled={isConnecting || !userName.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Creating...' : '🚀 Create New Session'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              />
              <button
                onClick={handleJoinSession}
                disabled={isConnecting || !sessionId.trim() || !userName.trim()}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Joining...' : '🔗 Join Session'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Session */
        <>
          {/* Session Info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Session: {session.sessionId.slice(-8)}
                </div>
                <div className="text-xs text-gray-500">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copySessionId}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  📋 Copy ID
                </button>
                <button
                  onClick={handleShareState}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                >
                  📤 Share View
                </button>
                <button
                  onClick={handleLeaveSession}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                >
                  🚪 Leave
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'session', label: 'Participants', icon: '👥' },
              { id: 'annotations', label: 'Notes', icon: '📝' },
              { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'session' && (
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{participant.name}</span>
                    {participant.id === userId && (
                      <span className="text-xs text-blue-600">(You)</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'annotations' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newAnnotation.text}
                    onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                    placeholder="Add a note..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleAddAnnotation}
                    disabled={!newAnnotation.text.trim()}
                    className="w-full bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
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
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newBookmark.name}
                    onChange={(e) => setNewBookmark({ ...newBookmark, name: e.target.value })}
                    placeholder="Bookmark name..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleCreateBookmark}
                    disabled={!newBookmark.name.trim()}
                    className="w-full bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Save Bookmark
                  </button>
                </div>
                <div className="space-y-2">
                  {bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{bookmark.name}</div>
                        <button
                          onClick={() => handleLoadBookmark(bookmark.id)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Load
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        by {bookmark.createdByName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
