// Accessibility preferences panel for user customization
// Provides user-friendly controls for accessibility settings

import { useState, useEffect } from 'react'
import { accessibilityManager } from '../../lib/accessibilitySystem'
import { AccessibleButton, AccessibleCheckbox, AccessibleSelect } from './AccessibleComponents'

export default function AccessibilityPreferences({ 
  isOpen, 
  onClose,
  className = '' 
}) {
  const [preferences, setPreferences] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  // Load current preferences
  useEffect(() => {
    if (isOpen) {
      const current = accessibilityManager.loadPreferences()
      setPreferences({
        highContrast: current.highContrast || false,
        fontSize: current.fontSize || 100,
        reducedMotion: current.reducedMotion || false,
        screenReader: current.screenReader || false,
        keyboardNavigation: current.keyboardNavigation || false,
        ...current
      })
      setHasChanges(false)
    }
  }, [isOpen])

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const savePreferences = () => {
    // Apply preferences immediately
    if (preferences.highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }

    if (preferences.reducedMotion) {
      document.body.classList.add('reduced-motion')
    } else {
      document.body.classList.remove('reduced-motion')
    }

    if (preferences.fontSize !== 100) {
      document.documentElement.style.fontSize = `${preferences.fontSize}%`
    } else {
      document.documentElement.style.fontSize = ''
    }

    // Save to accessibility manager
    accessibilityManager.preferences = preferences
    accessibilityManager.savePreferences()

    // Announce changes
    accessibilityManager.announce('Accessibility preferences saved successfully')
    
    setHasChanges(false)
    onClose()
  }

  const resetPreferences = () => {
    const defaultPrefs = {
      highContrast: false,
      fontSize: 100,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false
    }
    
    setPreferences(defaultPrefs)
    setHasChanges(true)
    
    // Apply defaults immediately
    document.body.classList.remove('high-contrast', 'reduced-motion')
    document.documentElement.style.fontSize = ''
    
    accessibilityManager.announce('Accessibility preferences reset to defaults')
  }

  const fontSizeOptions = [
    { value: 80, label: 'Small (80%)' },
    { value: 90, label: 'Small (90%)' },
    { value: 100, label: 'Normal (100%)' },
    { value: 110, label: 'Large (110%)' },
    { value: 120, label: 'Large (120%)' },
    { value: 130, label: 'Extra Large (130%)' },
    { value: 140, label: 'Extra Large (140%)' },
    { value: 150, label: 'Maximum (150%)' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            ♿ Accessibility Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="Close accessibility preferences"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Visual Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visual Preferences</h3>
              <div className="space-y-4">
                <AccessibleCheckbox
                  id="high-contrast"
                  label="High Contrast Mode"
                  description="Increases contrast for better visibility"
                  checked={preferences.highContrast}
                  onChange={(e) => updatePreference('highContrast', e.target.checked)}
                />

                <AccessibleSelect
                  id="font-size"
                  label="Font Size"
                  help="Adjust text size for better readability"
                  value={preferences.fontSize}
                  onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
                  options={fontSizeOptions}
                />
              </div>
            </div>

            {/* Motion Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Motion Preferences</h3>
              <div className="space-y-4">
                <AccessibleCheckbox
                  id="reduced-motion"
                  label="Reduce Motion"
                  description="Minimizes animations and transitions"
                  checked={preferences.reducedMotion}
                  onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                />
              </div>
            </div>

            {/* Navigation Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Preferences</h3>
              <div className="space-y-4">
                <AccessibleCheckbox
                  id="keyboard-navigation"
                  label="Enhanced Keyboard Navigation"
                  description="Shows focus indicators and keyboard shortcuts"
                  checked={preferences.keyboardNavigation}
                  onChange={(e) => updatePreference('keyboardNavigation', e.target.checked)}
                />

                <AccessibleCheckbox
                  id="screen-reader"
                  label="Screen Reader Optimizations"
                  description="Enhanced announcements and descriptions"
                  checked={preferences.screenReader}
                  onChange={(e) => updatePreference('screenReader', e.target.checked)}
                />
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Keyboard Shortcuts</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt + M</kbd> Skip to main content</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt + N</kbd> Skip to navigation</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt + C</kbd> Toggle high contrast</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt + +</kbd> Increase font size</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt + -</kbd> Decrease font size</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Esc</kbd> Close modals/dropdowns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <AccessibleButton
            variant="secondary"
            onClick={resetPreferences}
            disabled={!hasChanges}
          >
            Reset to Defaults
          </AccessibleButton>
          
          <div className="flex space-x-3">
            <AccessibleButton
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              variant="primary"
              onClick={savePreferences}
              disabled={!hasChanges}
            >
              Save Preferences
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// Accessibility preferences trigger button
export function AccessibilityPreferencesButton({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110 ${className}`}
        title="Open accessibility preferences"
        aria-label="Open accessibility preferences"
      >
        <span className="text-xl" aria-hidden="true">♿</span>
      </button>

      <AccessibilityPreferences
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
