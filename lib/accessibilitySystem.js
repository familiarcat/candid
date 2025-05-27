// Comprehensive accessibility system for Candid Connections
// Provides WCAG 2.1 AA compliance and enhanced user experience

import { mobileDetector } from './mobileAnimations'

/**
 * Accessibility Manager - Core accessibility functionality
 */
export class AccessibilityManager {
  constructor() {
    this.focusHistory = []
    this.announcements = []
    this.preferences = this.loadPreferences()
    this.isInitialized = false
    this.liveRegion = null
    this.skipLinks = []
  }

  /**
   * Initialize accessibility features
   */
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return

    this.createLiveRegion()
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupSkipLinks()
    this.applyUserPreferences()
    this.monitorColorScheme()

    this.isInitialized = true
    console.log('♿ Accessibility system initialized')
  }

  /**
   * Create ARIA live region for announcements
   */
  createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.setAttribute('class', 'sr-only')
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(this.liveRegion)
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    if (!this.liveRegion) return

    // Clear previous announcement
    this.liveRegion.textContent = ''
    
    // Set new priority
    this.liveRegion.setAttribute('aria-live', priority)
    
    // Announce after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      this.liveRegion.textContent = message
      this.announcements.push({
        message,
        priority,
        timestamp: Date.now()
      })
    }, 100)
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + M)
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        this.skipToMain()
      }

      // Skip to navigation (Alt + N)
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        this.skipToNavigation()
      }

      // Toggle high contrast (Alt + C)
      if (e.altKey && e.key === 'c') {
        e.preventDefault()
        this.toggleHighContrast()
      }

      // Increase font size (Alt + Plus)
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        this.increaseFontSize()
      }

      // Decrease font size (Alt + Minus)
      if (e.altKey && e.key === '-') {
        e.preventDefault()
        this.decreaseFontSize()
      }

      // Escape key handling
      if (e.key === 'Escape') {
        this.handleEscape()
      }
    })
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Track focus changes
    document.addEventListener('focusin', (e) => {
      this.focusHistory.push({
        element: e.target,
        timestamp: Date.now()
      })

      // Keep focus history manageable
      if (this.focusHistory.length > 10) {
        this.focusHistory = this.focusHistory.slice(-5)
      }
    })

    // Add focus indicators for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation')
    })
  }

  /**
   * Setup skip links
   */
  setupSkipLinks() {
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#search" class="skip-link">Skip to search</a>
    `
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
  }

  /**
   * Skip to main content
   */
  skipToMain() {
    const main = document.getElementById('main-content') || document.querySelector('main')
    if (main) {
      main.focus()
      main.scrollIntoView({ behavior: 'smooth' })
      this.announce('Skipped to main content')
    }
  }

  /**
   * Skip to navigation
   */
  skipToNavigation() {
    const nav = document.getElementById('navigation') || document.querySelector('nav')
    if (nav) {
      const firstLink = nav.querySelector('a, button')
      if (firstLink) {
        firstLink.focus()
        this.announce('Skipped to navigation')
      }
    }
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    const isHighContrast = document.body.classList.toggle('high-contrast')
    this.preferences.highContrast = isHighContrast
    this.savePreferences()
    this.announce(isHighContrast ? 'High contrast enabled' : 'High contrast disabled')
  }

  /**
   * Increase font size
   */
  increaseFontSize() {
    const currentSize = this.preferences.fontSize || 100
    const newSize = Math.min(currentSize + 10, 150)
    this.setFontSize(newSize)
    this.announce(`Font size increased to ${newSize}%`)
  }

  /**
   * Decrease font size
   */
  decreaseFontSize() {
    const currentSize = this.preferences.fontSize || 100
    const newSize = Math.max(currentSize - 10, 80)
    this.setFontSize(newSize)
    this.announce(`Font size decreased to ${newSize}%`)
  }

  /**
   * Set font size
   */
  setFontSize(percentage) {
    document.documentElement.style.fontSize = `${percentage}%`
    this.preferences.fontSize = percentage
    this.savePreferences()
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Close modals
    const modals = document.querySelectorAll('[role="dialog"]:not([aria-hidden="true"])')
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]')
      if (closeButton) {
        closeButton.click()
      }
    })

    // Close dropdowns
    const dropdowns = document.querySelectorAll('[aria-expanded="true"]')
    dropdowns.forEach(dropdown => {
      dropdown.setAttribute('aria-expanded', 'false')
    })
  }

  /**
   * Apply user preferences
   */
  applyUserPreferences() {
    if (this.preferences.highContrast) {
      document.body.classList.add('high-contrast')
    }

    if (this.preferences.fontSize) {
      this.setFontSize(this.preferences.fontSize)
    }

    if (this.preferences.reducedMotion) {
      document.body.classList.add('reduced-motion')
    }
  }

  /**
   * Monitor color scheme changes
   */
  monitorColorScheme() {
    if (!window.matchMedia) return

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    darkModeQuery.addEventListener('change', (e) => {
      document.body.classList.toggle('dark-mode', e.matches)
      this.announce(e.matches ? 'Dark mode enabled' : 'Light mode enabled')
    })

    reducedMotionQuery.addEventListener('change', (e) => {
      document.body.classList.toggle('reduced-motion', e.matches)
      this.preferences.reducedMotion = e.matches
      this.savePreferences()
    })

    // Apply initial states
    document.body.classList.toggle('dark-mode', darkModeQuery.matches)
    document.body.classList.toggle('reduced-motion', reducedMotionQuery.matches)
  }

  /**
   * Load user preferences
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem('accessibility-preferences')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  /**
   * Save user preferences
   */
  savePreferences() {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences))
    } catch (error) {
      console.warn('Could not save accessibility preferences:', error)
    }
  }

  /**
   * Get accessibility report
   */
  getAccessibilityReport() {
    return {
      isInitialized: this.isInitialized,
      preferences: this.preferences,
      announcements: this.announcements.slice(-5),
      focusHistory: this.focusHistory.slice(-3),
      features: {
        liveRegion: !!this.liveRegion,
        keyboardNavigation: true,
        skipLinks: this.skipLinks.length,
        highContrast: this.preferences.highContrast,
        fontSize: this.preferences.fontSize || 100
      }
    }
  }
}

/**
 * Color Contrast Checker
 */
export class ColorContrastChecker {
  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(color1)
    const lum2 = this.getLuminance(color2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * Get relative luminance of a color
   */
  static getLuminance(color) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }

  /**
   * Check if contrast meets WCAG standards
   */
  static meetsWCAG(foreground, background, level = 'AA', size = 'normal') {
    const ratio = this.getContrastRatio(foreground, background)
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  }

  /**
   * Get contrast grade
   */
  static getContrastGrade(foreground, background) {
    const ratio = this.getContrastRatio(foreground, background)
    
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3) return 'AA Large'
    return 'Fail'
  }
}

/**
 * Focus Management Utilities
 */
export class FocusManager {
  /**
   * Trap focus within an element
   */
  static trapFocus(element) {
    const focusableElements = this.getFocusableElements(element)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    firstElement.focus()

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(selector))
      .filter(el => !el.hasAttribute('aria-hidden'))
  }

  /**
   * Set focus to element with announcement
   */
  static setFocus(element, announcement) {
    if (!element) return

    element.focus()
    
    if (announcement && accessibilityManager) {
      accessibilityManager.announce(announcement)
    }
  }

  /**
   * Create focus indicator
   */
  static createFocusIndicator(element, options = {}) {
    const {
      color = '#005fcc',
      width = '2px',
      offset = '2px',
      borderRadius = '4px'
    } = options

    element.style.outline = 'none'
    element.addEventListener('focus', () => {
      element.style.boxShadow = `0 0 0 ${width} ${color}`
      element.style.borderRadius = borderRadius
    })

    element.addEventListener('blur', () => {
      element.style.boxShadow = 'none'
    })
  }
}

// Global accessibility manager instance
export const accessibilityManager = new AccessibilityManager()

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    accessibilityManager.initialize()
  })
}

// Utility functions
export function announceToScreenReader(message, priority = 'polite') {
  accessibilityManager.announce(message, priority)
}

export function checkColorContrast(foreground, background) {
  return ColorContrastChecker.getContrastGrade(foreground, background)
}

export function trapFocus(element) {
  return FocusManager.trapFocus(element)
}

export function setFocus(element, announcement) {
  return FocusManager.setFocus(element, announcement)
}

export default {
  AccessibilityManager,
  ColorContrastChecker,
  FocusManager,
  accessibilityManager,
  announceToScreenReader,
  checkColorContrast,
  trapFocus,
  setFocus
}
