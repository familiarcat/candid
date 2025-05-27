// Advanced animation system for Candid Connections
// Provides smooth, performant animations for visualizations and UI components

import * as d3 from 'd3'

/**
 * Animation configuration constants
 */
export const ANIMATION_CONFIG = {
  // Duration presets
  DURATION: {
    FAST: 200,
    NORMAL: 400,
    SLOW: 800,
    EXTRA_SLOW: 1200
  },
  
  // Easing functions
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  
  // Animation types
  TYPES: {
    FADE: 'fade',
    SLIDE: 'slide',
    SCALE: 'scale',
    ROTATE: 'rotate',
    MORPH: 'morph'
  }
}

/**
 * CSS Animation utilities
 */
export class CSSAnimator {
  constructor() {
    this.activeAnimations = new Map()
  }

  /**
   * Animate element with CSS transitions
   */
  animate(element, properties, options = {}) {
    const {
      duration = ANIMATION_CONFIG.DURATION.NORMAL,
      easing = ANIMATION_CONFIG.EASING.EASE_OUT,
      delay = 0,
      onComplete = () => {}
    } = options

    if (!element) return Promise.resolve()

    return new Promise((resolve) => {
      const animationId = Math.random().toString(36).substr(2, 9)
      
      // Set transition properties
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`
      
      // Apply new properties
      Object.entries(properties).forEach(([prop, value]) => {
        element.style[prop] = value
      })

      // Handle completion
      const handleComplete = () => {
        element.style.transition = ''
        this.activeAnimations.delete(animationId)
        onComplete()
        resolve()
      }

      // Set timeout as fallback
      const timeoutId = setTimeout(handleComplete, duration + delay + 50)
      
      // Listen for transition end
      const handleTransitionEnd = (e) => {
        if (e.target === element) {
          clearTimeout(timeoutId)
          element.removeEventListener('transitionend', handleTransitionEnd)
          handleComplete()
        }
      }
      
      element.addEventListener('transitionend', handleTransitionEnd)
      this.activeAnimations.set(animationId, { element, timeoutId })
    })
  }

  /**
   * Fade in animation
   */
  fadeIn(element, options = {}) {
    if (!element) return Promise.resolve()
    
    element.style.opacity = '0'
    element.style.display = 'block'
    
    return this.animate(element, { opacity: '1' }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ...options
    })
  }

  /**
   * Fade out animation
   */
  fadeOut(element, options = {}) {
    if (!element) return Promise.resolve()
    
    return this.animate(element, { opacity: '0' }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ...options
    }).then(() => {
      element.style.display = 'none'
    })
  }

  /**
   * Slide down animation
   */
  slideDown(element, options = {}) {
    if (!element) return Promise.resolve()
    
    const height = element.scrollHeight
    element.style.height = '0px'
    element.style.overflow = 'hidden'
    element.style.display = 'block'
    
    return this.animate(element, { height: `${height}px` }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ...options
    }).then(() => {
      element.style.height = 'auto'
      element.style.overflow = 'visible'
    })
  }

  /**
   * Slide up animation
   */
  slideUp(element, options = {}) {
    if (!element) return Promise.resolve()
    
    const height = element.scrollHeight
    element.style.height = `${height}px`
    element.style.overflow = 'hidden'
    
    return this.animate(element, { height: '0px' }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ...options
    }).then(() => {
      element.style.display = 'none'
      element.style.height = 'auto'
      element.style.overflow = 'visible'
    })
  }

  /**
   * Scale animation
   */
  scale(element, scale = 1, options = {}) {
    if (!element) return Promise.resolve()
    
    return this.animate(element, { 
      transform: `scale(${scale})` 
    }, {
      duration: ANIMATION_CONFIG.DURATION.FAST,
      easing: ANIMATION_CONFIG.EASING.BOUNCE,
      ...options
    })
  }

  /**
   * Pulse animation
   */
  pulse(element, options = {}) {
    if (!element) return Promise.resolve()
    
    const { pulses = 3, intensity = 1.1 } = options
    
    let promise = Promise.resolve()
    
    for (let i = 0; i < pulses; i++) {
      promise = promise
        .then(() => this.scale(element, intensity, { duration: ANIMATION_CONFIG.DURATION.FAST }))
        .then(() => this.scale(element, 1, { duration: ANIMATION_CONFIG.DURATION.FAST }))
    }
    
    return promise
  }

  /**
   * Cancel all animations for an element
   */
  cancelAnimations(element) {
    for (const [id, animation] of this.activeAnimations.entries()) {
      if (animation.element === element) {
        clearTimeout(animation.timeoutId)
        this.activeAnimations.delete(id)
        element.style.transition = ''
      }
    }
  }

  /**
   * Cancel all active animations
   */
  cancelAll() {
    for (const [id, animation] of this.activeAnimations.entries()) {
      clearTimeout(animation.timeoutId)
      animation.element.style.transition = ''
    }
    this.activeAnimations.clear()
  }
}

/**
 * D3.js Animation utilities
 */
export class D3Animator {
  constructor() {
    this.activeTransitions = new Set()
  }

  /**
   * Animate nodes with smooth transitions
   */
  animateNodes(selection, properties, options = {}) {
    const {
      duration = ANIMATION_CONFIG.DURATION.NORMAL,
      delay = 0,
      ease = d3.easeElastic
    } = options

    const transition = selection
      .transition()
      .duration(duration)
      .delay(delay)
      .ease(ease)

    this.activeTransitions.add(transition)

    // Apply properties
    Object.entries(properties).forEach(([attr, value]) => {
      if (typeof value === 'function') {
        transition.attr(attr, value)
      } else {
        transition.attr(attr, value)
      }
    })

    // Clean up on end
    transition.on('end', () => {
      this.activeTransitions.delete(transition)
    })

    return transition
  }

  /**
   * Animate node positions
   */
  animatePositions(nodeSelection, options = {}) {
    return this.animateNodes(nodeSelection, {
      cx: d => d.x,
      cy: d => d.y,
      transform: d => `translate(${d.x}, ${d.y})`
    }, {
      duration: ANIMATION_CONFIG.DURATION.SLOW,
      ease: d3.easeElastic,
      ...options
    })
  }

  /**
   * Animate link positions
   */
  animateLinks(linkSelection, options = {}) {
    return this.animateNodes(linkSelection, {
      x1: d => d.source.x,
      y1: d => d.source.y,
      x2: d => d.target.x,
      y2: d => d.target.y,
      d: d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
    }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ease: d3.easeQuadOut,
      ...options
    })
  }

  /**
   * Animate node entrance
   */
  animateEntrance(selection, options = {}) {
    selection
      .attr('opacity', 0)
      .attr('transform', d => `translate(${d.x}, ${d.y}) scale(0)`)

    return this.animateNodes(selection, {
      opacity: 1,
      transform: d => `translate(${d.x}, ${d.y}) scale(1)`
    }, {
      duration: ANIMATION_CONFIG.DURATION.SLOW,
      ease: d3.easeElastic,
      delay: (d, i) => i * 50, // Stagger animation
      ...options
    })
  }

  /**
   * Animate node exit
   */
  animateExit(selection, options = {}) {
    return this.animateNodes(selection, {
      opacity: 0,
      transform: d => `translate(${d.x}, ${d.y}) scale(0)`
    }, {
      duration: ANIMATION_CONFIG.DURATION.NORMAL,
      ease: d3.easeQuadIn,
      ...options
    }).remove()
  }

  /**
   * Cancel all active transitions
   */
  cancelAll() {
    this.activeTransitions.forEach(transition => {
      transition.interrupt()
    })
    this.activeTransitions.clear()
  }
}

/**
 * Three.js Animation utilities
 */
export class ThreeAnimator {
  constructor() {
    this.activeTweens = new Set()
  }

  /**
   * Animate camera position
   */
  animateCamera(camera, targetPosition, options = {}) {
    const {
      duration = ANIMATION_CONFIG.DURATION.SLOW,
      onUpdate = () => {},
      onComplete = () => {}
    } = options

    // Use TWEEN.js if available, otherwise fallback to simple interpolation
    if (typeof TWEEN !== 'undefined') {
      const tween = new TWEEN.Tween(camera.position)
        .to(targetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => onUpdate())
        .onComplete(() => {
          this.activeTweens.delete(tween)
          onComplete()
        })
        .start()

      this.activeTweens.add(tween)
      return tween
    } else {
      // Fallback animation
      const startPosition = { ...camera.position }
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic

        camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased
        camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased
        camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased

        onUpdate()

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          onComplete()
        }
      }

      animate()
    }
  }

  /**
   * Animate node positions in 3D
   */
  animateNodePositions(nodes, targetPositions, options = {}) {
    const {
      duration = ANIMATION_CONFIG.DURATION.NORMAL,
      onUpdate = () => {},
      onComplete = () => {}
    } = options

    const startTime = Date.now()
    const startPositions = nodes.map(node => ({ ...node.position }))

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2) // Ease out quad

      nodes.forEach((node, i) => {
        const start = startPositions[i]
        const target = targetPositions[i]

        node.position.x = start.x + (target.x - start.x) * eased
        node.position.y = start.y + (target.y - start.y) * eased
        node.position.z = start.z + (target.z - start.z) * eased
      })

      onUpdate()

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animate()
  }

  /**
   * Cancel all active animations
   */
  cancelAll() {
    if (typeof TWEEN !== 'undefined') {
      this.activeTweens.forEach(tween => {
        tween.stop()
      })
    }
    this.activeTweens.clear()
  }
}

// Global animator instances
export const cssAnimator = new CSSAnimator()
export const d3Animator = new D3Animator()
export const threeAnimator = new ThreeAnimator()

// Utility functions
export function createStaggeredAnimation(elements, animationFn, staggerDelay = 100) {
  return elements.map((element, index) => {
    return new Promise(resolve => {
      setTimeout(() => {
        animationFn(element).then(resolve)
      }, index * staggerDelay)
    })
  })
}

export function createSequentialAnimation(animations) {
  return animations.reduce((promise, animation) => {
    return promise.then(() => animation())
  }, Promise.resolve())
}

export default {
  ANIMATION_CONFIG,
  CSSAnimator,
  D3Animator,
  ThreeAnimator,
  cssAnimator,
  d3Animator,
  threeAnimator,
  createStaggeredAnimation,
  createSequentialAnimation
}
