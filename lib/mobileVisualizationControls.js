// Mobile Visualization Controls for Candid Connections
// Touch-optimized controls for 3D visualizations on mobile devices

/**
 * Mobile Touch Controls for 3D Visualizations
 * Handles touch gestures, mobile-specific interactions, and responsive behavior
 */
export class MobileVisualizationControls {
  constructor(renderer, camera, scene, container) {
    this.renderer = renderer
    this.camera = camera
    this.scene = scene
    this.container = container
    
    // Touch state management
    this.touches = new Map()
    this.lastTouchDistance = 0
    this.lastTouchCenter = { x: 0, y: 0 }
    this.isRotating = false
    this.isPinching = false
    this.isDragging = false
    
    // Mobile-specific settings
    this.touchSensitivity = 0.005
    this.pinchSensitivity = 0.01
    this.rotationSensitivity = 0.003
    this.dampingFactor = 0.9
    this.minZoom = 0.5
    this.maxZoom = 5.0
    
    // Performance optimization
    this.lastFrameTime = 0
    this.frameThrottle = 16 // ~60fps
    
    // Initialize touch controls
    this.initializeTouchControls()
    this.initializeDeviceOrientationControls()
  }

  /**
   * Initialize touch event listeners
   */
  initializeTouchControls() {
    if (!this.container) return

    // Prevent default touch behaviors
    this.container.style.touchAction = 'none'
    this.container.style.userSelect = 'none'
    this.container.style.webkitUserSelect = 'none'

    // Touch event listeners
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.container.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false })

    // Gesture event listeners (iOS Safari)
    this.container.addEventListener('gesturestart', this.handleGestureStart.bind(this), { passive: false })
    this.container.addEventListener('gesturechange', this.handleGestureChange.bind(this), { passive: false })
    this.container.addEventListener('gestureend', this.handleGestureEnd.bind(this), { passive: false })
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(event) {
    event.preventDefault()
    
    const currentTime = Date.now()
    if (currentTime - this.lastFrameTime < this.frameThrottle) return
    this.lastFrameTime = currentTime

    // Store touch information
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i]
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startTime: currentTime
      })
    }

    // Determine interaction type
    if (event.touches.length === 1) {
      this.isDragging = true
      this.isRotating = true
    } else if (event.touches.length === 2) {
      this.isPinching = true
      this.isDragging = false
      this.isRotating = false
      
      // Calculate initial pinch distance and center
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      
      this.lastTouchDistance = this.calculateDistance(touch1, touch2)
      this.lastTouchCenter = this.calculateCenter(touch1, touch2)
    }
  }

  /**
   * Handle touch move events
   */
  handleTouchMove(event) {
    event.preventDefault()
    
    const currentTime = Date.now()
    if (currentTime - this.lastFrameTime < this.frameThrottle) return
    this.lastFrameTime = currentTime

    if (event.touches.length === 1 && this.isRotating) {
      this.handleSingleTouchRotation(event.touches[0])
    } else if (event.touches.length === 2 && this.isPinching) {
      this.handlePinchZoom(event.touches[0], event.touches[1])
    }
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event) {
    event.preventDefault()

    // Remove ended touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.touches.delete(touch.identifier)
    }

    // Reset interaction states
    if (event.touches.length === 0) {
      this.isDragging = false
      this.isRotating = false
      this.isPinching = false
    } else if (event.touches.length === 1) {
      this.isPinching = false
      this.isRotating = true
    }
  }

  /**
   * Handle single touch rotation
   */
  handleSingleTouchRotation(touch) {
    const storedTouch = this.touches.get(touch.identifier)
    if (!storedTouch) return

    const deltaX = touch.clientX - storedTouch.x
    const deltaY = touch.clientY - storedTouch.y

    // Apply rotation to camera
    if (this.camera.position) {
      const spherical = this.cartesianToSpherical(this.camera.position)
      
      spherical.theta -= deltaX * this.rotationSensitivity
      spherical.phi += deltaY * this.rotationSensitivity
      
      // Clamp phi to prevent flipping
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
      
      const newPosition = this.sphericalToCartesian(spherical)
      this.camera.position.copy(newPosition)
      this.camera.lookAt(0, 0, 0)
    }

    // Update stored touch position
    storedTouch.x = touch.clientX
    storedTouch.y = touch.clientY
  }

  /**
   * Handle pinch zoom
   */
  handlePinchZoom(touch1, touch2) {
    const currentDistance = this.calculateDistance(touch1, touch2)
    const currentCenter = this.calculateCenter(touch1, touch2)

    if (this.lastTouchDistance > 0) {
      const scale = currentDistance / this.lastTouchDistance
      const zoomDelta = (scale - 1) * this.pinchSensitivity

      // Apply zoom to camera
      if (this.camera.position) {
        const direction = this.camera.position.clone().normalize()
        const currentDistance = this.camera.position.length()
        const newDistance = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, currentDistance - zoomDelta * currentDistance)
        )
        
        this.camera.position.copy(direction.multiplyScalar(newDistance))
      }
    }

    this.lastTouchDistance = currentDistance
    this.lastTouchCenter = currentCenter
  }

  /**
   * Handle gesture events (iOS Safari)
   */
  handleGestureStart(event) {
    event.preventDefault()
    this.isPinching = true
  }

  handleGestureChange(event) {
    event.preventDefault()
    
    if (this.camera.position) {
      const scale = event.scale
      const direction = this.camera.position.clone().normalize()
      const currentDistance = this.camera.position.length()
      const newDistance = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, currentDistance / scale)
      )
      
      this.camera.position.copy(direction.multiplyScalar(newDistance))
    }
  }

  handleGestureEnd(event) {
    event.preventDefault()
    this.isPinching = false
  }

  /**
   * Initialize device orientation controls
   */
  initializeDeviceOrientationControls() {
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
      // iOS 13+ permission request
      this.requestDeviceOrientationPermission()
    } else if (window.DeviceOrientationEvent) {
      // Android and older iOS
      window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this))
    }
  }

  /**
   * Request device orientation permission (iOS 13+)
   */
  async requestDeviceOrientationPermission() {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this))
      }
    } catch (error) {
      console.log('Device orientation not supported or permission denied')
    }
  }

  /**
   * Handle device orientation changes
   */
  handleDeviceOrientation(event) {
    // Optional: Use device orientation for subtle camera adjustments
    // This can be enabled/disabled based on user preference
    if (this.useDeviceOrientation && this.camera) {
      const alpha = event.alpha * Math.PI / 180 // Z axis
      const beta = event.beta * Math.PI / 180   // X axis
      const gamma = event.gamma * Math.PI / 180 // Y axis
      
      // Apply subtle orientation-based camera adjustments
      // Implementation depends on specific UX requirements
    }
  }

  /**
   * Utility: Calculate distance between two touches
   */
  calculateDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Utility: Calculate center point between two touches
   */
  calculateCenter(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  /**
   * Utility: Convert cartesian to spherical coordinates
   */
  cartesianToSpherical(position) {
    const radius = position.length()
    const theta = Math.atan2(position.x, position.z)
    const phi = Math.acos(position.y / radius)
    
    return { radius, theta, phi }
  }

  /**
   * Utility: Convert spherical to cartesian coordinates
   */
  sphericalToCartesian(spherical) {
    const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    const y = spherical.radius * Math.cos(spherical.phi)
    const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    
    return { x, y, z }
  }

  /**
   * Enable/disable device orientation controls
   */
  setDeviceOrientationEnabled(enabled) {
    this.useDeviceOrientation = enabled
  }

  /**
   * Update sensitivity settings
   */
  updateSensitivity(settings) {
    if (settings.touch) this.touchSensitivity = settings.touch
    if (settings.pinch) this.pinchSensitivity = settings.pinch
    if (settings.rotation) this.rotationSensitivity = settings.rotation
  }

  /**
   * Get current touch state for debugging
   */
  getTouchState() {
    return {
      activeTouches: this.touches.size,
      isRotating: this.isRotating,
      isPinching: this.isPinching,
      isDragging: this.isDragging,
      lastTouchDistance: this.lastTouchDistance,
      lastTouchCenter: this.lastTouchCenter
    }
  }

  /**
   * Cleanup event listeners
   */
  dispose() {
    if (this.container) {
      this.container.removeEventListener('touchstart', this.handleTouchStart)
      this.container.removeEventListener('touchmove', this.handleTouchMove)
      this.container.removeEventListener('touchend', this.handleTouchEnd)
      this.container.removeEventListener('touchcancel', this.handleTouchEnd)
      this.container.removeEventListener('gesturestart', this.handleGestureStart)
      this.container.removeEventListener('gesturechange', this.handleGestureChange)
      this.container.removeEventListener('gestureend', this.handleGestureEnd)
    }
    
    if (window.DeviceOrientationEvent) {
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation)
    }
    
    this.touches.clear()
  }
}

/**
 * Mobile Responsive Utilities
 */
export class MobileResponsiveUtils {
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static isTablet() {
    return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
  }

  static getTouchCapabilities() {
    return {
      hasTouch: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasGestures: 'ongesturestart' in window,
      hasDeviceOrientation: 'DeviceOrientationEvent' in window
    }
  }

  static getOptimalRenderSettings() {
    const isMobile = this.isMobile()
    const isTablet = this.isTablet()
    
    return {
      pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio,
      antialias: !isMobile, // Disable antialiasing on mobile for performance
      shadowMapSize: isMobile ? 512 : 1024,
      maxLights: isMobile ? 2 : 4,
      particleCount: isMobile ? 100 : 500,
      animationQuality: isMobile ? 'low' : 'high'
    }
  }

  static getViewportDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    }
  }
}

export default {
  MobileVisualizationControls,
  MobileResponsiveUtils
}
