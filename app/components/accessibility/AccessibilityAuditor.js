// Accessibility auditing and testing component
// Provides real-time accessibility checks and WCAG compliance monitoring

import { useState, useEffect, useRef } from 'react'
import { ColorContrastChecker, accessibilityManager } from '../../lib/accessibilitySystem'

export default function AccessibilityAuditor({ 
  enabled = process.env.NODE_ENV === 'development',
  autoRun = true,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [auditResults, setAuditResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Run audit automatically
  useEffect(() => {
    if (enabled && autoRun) {
      const timer = setTimeout(() => {
        runAudit()
      }, 2000) // Wait for page to load

      return () => clearTimeout(timer)
    }
  }, [enabled, autoRun])

  const runAudit = async () => {
    setIsRunning(true)
    
    try {
      const results = await performAccessibilityAudit()
      setAuditResults(results)
    } catch (error) {
      console.error('Accessibility audit failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  if (!enabled) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'contrast', label: 'Contrast', icon: '🎨' },
    { id: 'structure', label: 'Structure', icon: '🏗️' },
    { id: 'keyboard', label: 'Keyboard', icon: '⌨️' },
    { id: 'aria', label: 'ARIA', icon: '🏷️' }
  ]

  return (
    <>
      {/* Floating Audit Button */}
      {!isVisible && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setIsVisible(true)}
            className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              getAuditStatusColor(auditResults)
            }`}
            title="Open Accessibility Auditor"
          >
            <div className="text-white text-xs font-bold">
              {auditResults ? Math.round(auditResults.score) : '?'}
            </div>
            <div className="text-white text-xs">♿</div>
          </button>
        </div>
      )}

      {/* Audit Panel */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <h3 className="text-sm font-semibold text-gray-900">Accessibility Audit</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={runAudit}
                disabled={isRunning}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Run Audit"
              >
                <svg className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-3 h-80 overflow-y-auto">
            {isRunning ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Running accessibility audit...</p>
                </div>
              </div>
            ) : auditResults ? (
              <>
                {activeTab === 'overview' && <OverviewTab results={auditResults} />}
                {activeTab === 'contrast' && <ContrastTab results={auditResults} />}
                {activeTab === 'structure' && <StructureTab results={auditResults} />}
                {activeTab === 'keyboard' && <KeyboardTab results={auditResults} />}
                {activeTab === 'aria' && <AriaTab results={auditResults} />}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">♿</div>
                <p className="text-sm text-gray-600">Click the refresh button to run an accessibility audit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function OverviewTab({ results }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
          {Math.round(results.score)}%
        </div>
        <p className="text-sm text-gray-600">Accessibility Score</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Contrast Issues"
          value={results.contrastIssues}
          color={results.contrastIssues === 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Missing Alt Text"
          value={results.missingAltText}
          color={results.missingAltText === 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="ARIA Issues"
          value={results.ariaIssues}
          color={results.ariaIssues === 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Keyboard Issues"
          value={results.keyboardIssues}
          color={results.keyboardIssues === 0 ? 'green' : 'red'}
        />
      </div>

      {results.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Recommendations</h4>
          <div className="space-y-2">
            {results.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium text-yellow-800">{rec.type}</div>
                <div className="text-yellow-700">{rec.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ContrastTab({ results }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Color Contrast Analysis</h4>
      
      {results.contrastResults.length > 0 ? (
        <div className="space-y-2">
          {results.contrastResults.map((result, index) => (
            <div key={index} className={`p-2 rounded text-xs ${
              result.passes ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={result.passes ? 'text-green-800' : 'text-red-800'}>
                  {result.element}
                </span>
                <span className={`font-mono ${result.passes ? 'text-green-600' : 'text-red-600'}`}>
                  {result.ratio.toFixed(2)}:1
                </span>
              </div>
              <div className={`text-xs ${result.passes ? 'text-green-600' : 'text-red-600'}`}>
                {result.grade} - {result.passes ? 'Passes' : 'Fails'} WCAG {result.level}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No contrast issues found!</p>
      )}
    </div>
  )
}

function StructureTab({ results }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Document Structure</h4>
      
      <div className="space-y-2">
        <StructureItem
          label="Page Title"
          status={results.structure.hasTitle}
          details={results.structure.title}
        />
        <StructureItem
          label="Main Landmark"
          status={results.structure.hasMain}
          details={results.structure.mainCount + ' found'}
        />
        <StructureItem
          label="Heading Structure"
          status={results.structure.headingStructure}
          details={`H1: ${results.structure.h1Count}, H2: ${results.structure.h2Count}`}
        />
        <StructureItem
          label="Skip Links"
          status={results.structure.hasSkipLinks}
          details={results.structure.skipLinkCount + ' found'}
        />
      </div>
    </div>
  )
}

function KeyboardTab({ results }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Keyboard Navigation</h4>
      
      <div className="space-y-2">
        {results.keyboardResults.map((result, index) => (
          <div key={index} className={`p-2 rounded text-xs ${
            result.accessible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${result.accessible ? 'text-green-800' : 'text-red-800'}`}>
              {result.element}
            </div>
            <div className={result.accessible ? 'text-green-600' : 'text-red-600'}>
              {result.issue || 'Keyboard accessible'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AriaTab({ results }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">ARIA Implementation</h4>
      
      <div className="space-y-2">
        {results.ariaResults.map((result, index) => (
          <div key={index} className={`p-2 rounded text-xs ${
            result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
              {result.element}
            </div>
            <div className={result.valid ? 'text-green-600' : 'text-red-600'}>
              {result.issue || 'ARIA properly implemented'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ title, value, color = 'gray' }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className={`p-2 rounded-md border ${colorClasses[color]}`}>
      <div className="text-xs font-medium">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}

function StructureItem({ label, status, details }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-600">{label}</span>
      <div className="text-right">
        <span className={`font-medium ${status ? 'text-green-600' : 'text-red-600'}`}>
          {status ? '✓' : '✗'}
        </span>
        {details && (
          <div className="text-gray-500 text-xs">{details}</div>
        )}
      </div>
    </div>
  )
}

function getAuditStatusColor(results) {
  if (!results) return 'bg-gray-500 hover:bg-gray-600'
  
  const score = results.score
  if (score >= 90) return 'bg-green-500 hover:bg-green-600'
  if (score >= 70) return 'bg-yellow-500 hover:bg-yellow-600'
  return 'bg-red-500 hover:bg-red-600'
}

function getScoreColor(score) {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

// Accessibility audit function
async function performAccessibilityAudit() {
  const results = {
    score: 0,
    contrastIssues: 0,
    missingAltText: 0,
    ariaIssues: 0,
    keyboardIssues: 0,
    contrastResults: [],
    structure: {},
    keyboardResults: [],
    ariaResults: [],
    recommendations: []
  }

  // Check color contrast
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label')
  textElements.forEach((element, index) => {
    if (index < 10) { // Limit to first 10 for performance
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const ratio = ColorContrastChecker.getContrastRatio(color, backgroundColor)
        const grade = ColorContrastChecker.getContrastGrade(color, backgroundColor)
        const passes = ratio >= 4.5
        
        results.contrastResults.push({
          element: element.tagName.toLowerCase(),
          ratio,
          grade,
          passes
        })
        
        if (!passes) results.contrastIssues++
      }
    }
  })

  // Check alt text
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      results.missingAltText++
    }
  })

  // Check document structure
  results.structure = {
    hasTitle: !!document.title,
    title: document.title,
    hasMain: document.querySelectorAll('main').length > 0,
    mainCount: document.querySelectorAll('main').length,
    headingStructure: document.querySelectorAll('h1').length === 1,
    h1Count: document.querySelectorAll('h1').length,
    h2Count: document.querySelectorAll('h2').length,
    hasSkipLinks: document.querySelectorAll('.skip-link').length > 0,
    skipLinkCount: document.querySelectorAll('.skip-link').length
  }

  // Check keyboard accessibility
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]')
  interactiveElements.forEach((element, index) => {
    if (index < 5) { // Limit for performance
      const tabIndex = element.getAttribute('tabindex')
      const accessible = tabIndex !== '-1' && !element.disabled
      
      results.keyboardResults.push({
        element: element.tagName.toLowerCase(),
        accessible,
        issue: accessible ? null : 'Not keyboard accessible'
      })
      
      if (!accessible) results.keyboardIssues++
    }
  })

  // Check ARIA
  const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]')
  ariaElements.forEach((element, index) => {
    if (index < 5) { // Limit for performance
      const role = element.getAttribute('role')
      const valid = !role || ['button', 'link', 'dialog', 'alert', 'navigation'].includes(role)
      
      results.ariaResults.push({
        element: element.tagName.toLowerCase(),
        valid,
        issue: valid ? null : 'Invalid ARIA role'
      })
      
      if (!valid) results.ariaIssues++
    }
  })

  // Calculate score
  const totalIssues = results.contrastIssues + results.missingAltText + results.ariaIssues + results.keyboardIssues
  results.score = Math.max(0, 100 - (totalIssues * 10))

  // Generate recommendations
  if (results.contrastIssues > 0) {
    results.recommendations.push({
      type: 'Color Contrast',
      message: `Fix ${results.contrastIssues} color contrast issues for better readability`
    })
  }
  
  if (results.missingAltText > 0) {
    results.recommendations.push({
      type: 'Alt Text',
      message: `Add alt text to ${results.missingAltText} images for screen readers`
    })
  }

  return results
}
