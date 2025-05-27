// Interactive hover effects and micro-animations
// Provides reusable hover animations for enhanced user experience

import { useState, useRef, useEffect } from 'react'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'

/**
 * Animated button with hover effects
 */
export function AnimatedButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef(null)

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500'
  }

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true)
      cssAnimator.scale(buttonRef.current, 1.05, { duration: ANIMATION_CONFIG.DURATION.FAST })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    if (!disabled) {
      cssAnimator.scale(buttonRef.current, 1, { duration: ANIMATION_CONFIG.DURATION.FAST })
    }
  }

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true)
      cssAnimator.scale(buttonRef.current, 0.95, { duration: ANIMATION_CONFIG.DURATION.FAST })
    }
  }

  const handleMouseUp = () => {
    if (!disabled) {
      setIsPressed(false)
      cssAnimator.scale(buttonRef.current, isHovered ? 1.05 : 1, { 
        duration: ANIMATION_CONFIG.DURATION.FAST 
      })
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-lg font-medium transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transform-gpu
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Card with hover lift effect
 */
export function HoverCard({ 
  children, 
  onClick, 
  className = '',
  hoverScale = 1.02,
  hoverShadow = true,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (hoverScale !== 1) {
      cssAnimator.scale(cardRef.current, hoverScale, { 
        duration: ANIMATION_CONFIG.DURATION.NORMAL 
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (hoverScale !== 1) {
      cssAnimator.scale(cardRef.current, 1, { 
        duration: ANIMATION_CONFIG.DURATION.NORMAL 
      })
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        transition-all duration-300 transform-gpu
        ${hoverShadow ? (isHovered ? 'shadow-xl' : 'shadow-md') : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Floating action button with pulse effect
 */
export function FloatingActionButton({ 
  children, 
  onClick, 
  position = 'bottom-right',
  size = 'medium',
  color = 'indigo',
  pulse = false,
  className = '' 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef(null)

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  }

  const sizes = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  }

  const colors = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  }

  useEffect(() => {
    if (pulse && buttonRef.current) {
      const interval = setInterval(() => {
        cssAnimator.pulse(buttonRef.current, { pulses: 1, intensity: 1.1 })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [pulse])

  const handleMouseEnter = () => {
    setIsHovered(true)
    cssAnimator.scale(buttonRef.current, 1.1, { 
      duration: ANIMATION_CONFIG.DURATION.FAST,
      easing: ANIMATION_CONFIG.EASING.BOUNCE
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    cssAnimator.scale(buttonRef.current, 1, { 
      duration: ANIMATION_CONFIG.DURATION.FAST 
    })
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        ${positions[position]}
        ${sizes[size]}
        ${colors[color]}
        rounded-full shadow-lg text-white
        flex items-center justify-center
        transition-all duration-200 transform-gpu
        hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500
        z-50
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/**
 * Animated icon with rotation/bounce effects
 */
export function AnimatedIcon({ 
  children, 
  animation = 'none', 
  trigger = 'hover',
  className = '' 
}) {
  const [isTriggered, setIsTriggered] = useState(false)
  const iconRef = useRef(null)

  const handleTrigger = () => {
    if (trigger === 'hover') {
      setIsTriggered(true)
      performAnimation()
    }
  }

  const handleTriggerEnd = () => {
    if (trigger === 'hover') {
      setIsTriggered(false)
    }
  }

  const performAnimation = () => {
    if (!iconRef.current) return

    switch (animation) {
      case 'rotate':
        cssAnimator.animate(iconRef.current, {
          transform: 'rotate(360deg)'
        }, {
          duration: ANIMATION_CONFIG.DURATION.NORMAL,
          easing: ANIMATION_CONFIG.EASING.EASE_OUT
        })
        break
      
      case 'bounce':
        cssAnimator.pulse(iconRef.current, { pulses: 1, intensity: 1.2 })
        break
      
      case 'shake':
        const keyframes = [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(0)' }
        ]
        iconRef.current.animate(keyframes, {
          duration: ANIMATION_CONFIG.DURATION.FAST,
          easing: 'ease-in-out'
        })
        break
      
      case 'scale':
        cssAnimator.scale(iconRef.current, 1.2, { 
          duration: ANIMATION_CONFIG.DURATION.FAST 
        }).then(() => {
          cssAnimator.scale(iconRef.current, 1, { 
            duration: ANIMATION_CONFIG.DURATION.FAST 
          })
        })
        break
    }
  }

  // Auto-trigger for click animations
  useEffect(() => {
    if (trigger === 'click' && isTriggered) {
      performAnimation()
      const timer = setTimeout(() => setIsTriggered(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isTriggered, trigger])

  return (
    <span
      ref={iconRef}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
      onMouseLeave={trigger === 'hover' ? handleTriggerEnd : undefined}
      onClick={trigger === 'click' ? () => setIsTriggered(true) : undefined}
      className={`inline-block transition-transform duration-200 ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * Tooltip with smooth fade animation
 */
export function AnimatedTooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => {
        setIsVisible(true)
        if (tooltipRef.current) {
          cssAnimator.fadeIn(tooltipRef.current, { 
            duration: ANIMATION_CONFIG.DURATION.FAST 
          })
        }
      }, 10)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsVisible(false)
    if (tooltipRef.current) {
      cssAnimator.fadeOut(tooltipRef.current, { 
        duration: ANIMATION_CONFIG.DURATION.FAST 
      }).then(() => {
        setShowTooltip(false)
      })
    } else {
      setShowTooltip(false)
    }
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded
            opacity-0 pointer-events-none
            ${positions[position]}
          `}
        >
          {content}
          
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`}></div>
        </div>
      )}
    </div>
  )
}

export default {
  AnimatedButton,
  HoverCard,
  FloatingActionButton,
  AnimatedIcon,
  AnimatedTooltip
}
