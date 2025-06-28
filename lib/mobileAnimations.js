// Mobile-optimized animation system for Candid Connections
// Provides touch-friendly animations with performance optimization

import { cssAnimator, ANIMATION_CONFIG } from './animationSystem'

/**
 * Mobile device detection and capabilities
 */
export class MobileDetector {
  constructor() {
    this.isMobile = this.detectMobile()
    this.isTouch = this.detectTouch()
    this.supportsHover = this.detectHover()
    this.prefersReducedMotion = this.detectReducedMotion()
    this.devicePixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
  }

  detectMobile() {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  detectTouch() {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  detectHover() {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(hover: hover)').matches
  }

  detectReducedMotion() {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  getOptimalAnimationDuration(baseDuration) {
    if (this.prefersReducedMotion) return 0
    if (this.isMobile) return Math.max(baseDuration * 0.7, 150) // Faster on mobile
    return baseDuration
  }

  shouldUseAnimation() {
    return !this.prefersReducedMotion
  }
}

/**
 * Touch-optimized animation controller
 */
export class TouchAnimator {
  constructor() {
    this.detector = new MobileDetector()
    this.activeGestures = new Map()
    this.touchStartTime = 0
    this.touchStartPosition = { x: 0, y: 0 }
  }

  /**
   * Touch-friendly button animation
   */
  animateTouchButton(element, options = {}) {
    if (!element || !this.detector.shouldUseAnimation()) return Promise.resolve()

    const {
      pressScale = 0.95,
      releaseScale = 1,
      duration = this.detector.getOptimalAnimationDuration(ANIMATION_CONFIG.DURATION.FAST)
    } = options

    // Add touch event listeners
    const handleTouchStart = (e) => {
      e.preventDefault()
      this.touchStartTime = Date.now()
      this.touchStartPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }

      cssAnimator.scale(element, pressScale, { duration: duration / 2 })
      element.style.filter = 'brightness(0.9)'
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      const touchDuration = Date.now() - this.touchStartTime

      // Only trigger if it was a quick tap (not a long press)
      if (touchDuration < 500) {
        cssAnimator.scale(element, releaseScale, { duration: duration / 2 })
        element.style.filter = 'brightness(1)'

        // Add ripple effect
        this.createRippleEffect(element, e)
      }
    }

    const handleTouchCancel = () => {
      cssAnimator.scale(element, releaseScale, { duration: duration / 2 })
      element.style.filter = 'brightness(1)'
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false })

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }

  /**
   * Create ripple effect for touch interactions
   */
  createRippleEffect(element, touchEvent) {
    if (!this.detector.shouldUseAnimation()) return

    const rect = element.getBoundingClientRect()
    const ripple = document.createElement('div')

    const size = Math.max(rect.width, rect.height)
    const x = (touchEvent.changedTouches?.[0]?.clientX || touchEvent.clientX) - rect.left - size / 2
    const y = (touchEvent.changedTouches?.[0]?.clientY || touchEvent.clientY) - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
      z-index: 1000;
    `

    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(ripple)

    // Animate ripple
    cssAnimator.animate(ripple, {
      transform: 'scale(2)',
      opacity: '0'
    }, {
      duration: this.detector.getOptimalAnimationDuration(600),
      easing: ANIMATION_CONFIG.EASING.EASE_OUT
    }).then(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    })
  }

  /**
   * Swipe gesture detection and animation
   */
  setupSwipeGesture(element, callbacks = {}) {
    if (!element) return () => {}

    const {
      onSwipeLeft = () => {},
      onSwipeRight = () => {},
      onSwipeUp = () => {},
      onSwipeDown = () => {},
      threshold = 50
    } = callbacks

    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e) => {
      if (!startTime) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const deltaTime = Date.now() - startTime

      // Only consider quick swipes
      if (deltaTime > 300) return

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Determine swipe direction
      if (absDeltaX > threshold && absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          onSwipeRight(deltaX, deltaTime)
        } else {
          onSwipeLeft(Math.abs(deltaX), deltaTime)
        }
      } else if (absDeltaY > threshold && absDeltaY > absDeltaX) {
        if (deltaY > 0) {
          onSwipeDown(deltaY, deltaTime)
        } else {
          onSwipeUp(Math.abs(deltaY), deltaTime)
        }
      }

      startTime = 0
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }

  /**
   * Pull-to-refresh animation
   */
  setupPullToRefresh(element, onRefresh = () => {}) {
    if (!element) return () => {}

    let startY = 0
    let currentY = 0
    let isRefreshing = false
    const threshold = 80

    const refreshIndicator = document.createElement('div')
    refreshIndicator.style.cssText = `
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    `
    element.style.position = 'relative'
    element.appendChild(refreshIndicator)

    const handleTouchStart = (e) => {
      if (element.scrollTop === 0) {
        startY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e) => {
      if (isRefreshing || element.scrollTop > 0) return

      currentY = e.touches[0].clientY
      const deltaY = currentY - startY

      if (deltaY > 0 && deltaY < threshold * 2) {
        e.preventDefault()
        const progress = Math.min(deltaY / threshold, 1)

        refreshIndicator.style.opacity = progress
        refreshIndicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`
        element.style.transform = `translateY(${deltaY * 0.5}px)`
      }
    }

    const handleTouchEnd = () => {
      const deltaY = currentY - startY

      if (deltaY > threshold && !isRefreshing) {
        isRefreshing = true
        refreshIndicator.style.animation = 'spin 1s linear infinite'

        onRefresh().finally(() => {
          isRefreshing = false
          refreshIndicator.style.opacity = '0'
          refreshIndicator.style.animation = ''
          element.style.transform = 'translateY(0)'
        })
      } else {
        refreshIndicator.style.opacity = '0'
        element.style.transform = 'translateY(0)'
      }

      startY = 0
      currentY = 0
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      if (refreshIndicator.parentNode) {
        refreshIndicator.parentNode.removeChild(refreshIndicator)
      }
    }
  }

  /**
   * Optimize animations for mobile performance
   */
  optimizeForMobile(animationConfig) {
    if (!this.detector.isMobile) return animationConfig

    return {
      ...animationConfig,
      duration: this.detector.getOptimalAnimationDuration(animationConfig.duration || ANIMATION_CONFIG.DURATION.NORMAL),
      easing: ANIMATION_CONFIG.EASING.EASE_OUT, // Simpler easing for better performance
      useTransform: true, // Prefer transforms over layout changes
      willChange: 'transform, opacity' // Hint to browser for optimization
    }
  }
}

/**
 * Responsive animation utilities
 */
export class ResponsiveAnimator {
  constructor() {
    this.detector = new MobileDetector()
    this.breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  }

  getCurrentBreakpoint() {
    if (typeof window === 'undefined') return 'lg'

    const width = window.innerWidth || 1024

    if (width >= this.breakpoints['2xl']) return '2xl'
    if (width >= this.breakpoints.xl) return 'xl'
    if (width >= this.breakpoints.lg) return 'lg'
    if (width >= this.breakpoints.md) return 'md'
    if (width >= this.breakpoints.sm) return 'sm'
    return 'xs'
  }

  getResponsiveValue(values) {
    const breakpoint = this.getCurrentBreakpoint()

    // Return value for current breakpoint or fall back to smaller ones
    return values[breakpoint] ||
           values.lg ||
           values.md ||
           values.sm ||
           values.xs ||
           values.default
  }

  createResponsiveAnimation(element, animationsByBreakpoint) {
    const currentBreakpoint = this.getCurrentBreakpoint()
    const animation = animationsByBreakpoint[currentBreakpoint] || animationsByBreakpoint.default

    if (!animation || !this.detector.shouldUseAnimation()) {
      return Promise.resolve()
    }

    return cssAnimator.animate(element, animation.properties, {
      duration: this.detector.getOptimalAnimationDuration(animation.duration || ANIMATION_CONFIG.DURATION.NORMAL),
      easing: animation.easing || ANIMATION_CONFIG.EASING.EASE_OUT,
      ...animation.options
    })
  }
}

// Global instances (lazy-loaded to avoid SSR issues)
let _mobileDetector = null
let _touchAnimator = null
let _responsiveAnimator = null

export const mobileDetector = typeof window !== 'undefined' ?
  (_mobileDetector || (_mobileDetector = new MobileDetector())) :
  { isMobile: false, isTouch: false, supportsHover: true, prefersReducedMotion: false, getOptimalAnimationDuration: (d) => d, shouldUseAnimation: () => true }

export const touchAnimator = typeof window !== 'undefined' ?
  (_touchAnimator || (_touchAnimator = new TouchAnimator())) :
  { animateTouchButton: () => () => {}, setupSwipeGesture: () => () => {}, setupPullToRefresh: () => () => {} }

export const responsiveAnimator = typeof window !== 'undefined' ?
  (_responsiveAnimator || (_responsiveAnimator = new ResponsiveAnimator())) :
  { getCurrentBreakpoint: () => 'lg', getResponsiveValue: (values) => values.default || values.lg }

// Utility functions
export function isMobileDevice() {
  return mobileDetector.isMobile
}

export function shouldUseReducedMotion() {
  return mobileDetector.prefersReducedMotion
}

export function getOptimalDuration(baseDuration) {
  return mobileDetector.getOptimalAnimationDuration(baseDuration)
}

export default {
  MobileDetector,
  TouchAnimator,
  ResponsiveAnimator,
  mobileDetector,
  touchAnimator,
  responsiveAnimator,
  isMobileDevice,
  shouldUseReducedMotion,
  getOptimalDuration
}
