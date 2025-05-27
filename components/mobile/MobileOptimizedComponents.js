// Mobile-optimized UI components with touch-friendly animations
// Provides responsive components that work great on mobile devices

import { useState, useEffect, useRef } from 'react'
import { touchAnimator, responsiveAnimator, mobileDetector } from '../../lib/mobileAnimations'
import { cssAnimator, ANIMATION_CONFIG } from '../../lib/animationSystem'

/**
 * Mobile-optimized button with touch animations
 */
export function MobileButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) {
  const buttonRef = useRef(null)
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    if (!buttonRef.current) return

    const cleanup = touchAnimator.animateTouchButton(buttonRef.current, {
      pressScale: 0.95,
      releaseScale: 1,
      duration: 150
    })

    return cleanup
  }, [])

  const variants = {
    primary: 'bg-indigo-600 text-white active:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
    success: 'bg-green-600 text-white active:bg-green-700',
    danger: 'bg-red-600 text-white active:bg-red-700'
  }

  const sizes = {
    small: 'px-4 py-2 text-sm min-h-[40px]', // Minimum touch target
    medium: 'px-6 py-3 text-base min-h-[44px]',
    large: 'px-8 py-4 text-lg min-h-[48px]'
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-lg font-medium transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transform-gpu select-none
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Swipeable card component
 */
export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  className = '',
  ...props 
}) {
  const cardRef = useRef(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  useEffect(() => {
    if (!cardRef.current) return

    const cleanup = touchAnimator.setupSwipeGesture(cardRef.current, {
      onSwipeLeft: (distance) => {
        if (onSwipeLeft) {
          // Animate card sliding out
          cssAnimator.animate(cardRef.current, {
            transform: 'translateX(-100%)',
            opacity: '0'
          }, {
            duration: 300,
            easing: ANIMATION_CONFIG.EASING.EASE_OUT
          }).then(() => {
            onSwipeLeft()
          })
        }
      },
      onSwipeRight: (distance) => {
        if (onSwipeRight) {
          // Animate card sliding out
          cssAnimator.animate(cardRef.current, {
            transform: 'translateX(100%)',
            opacity: '0'
          }, {
            duration: 300,
            easing: ANIMATION_CONFIG.EASING.EASE_OUT
          }).then(() => {
            onSwipeRight()
          })
        }
      },
      threshold: 80
    })

    return cleanup
  }, [onSwipeLeft, onSwipeRight])

  return (
    <div
      ref={cardRef}
      className={`
        bg-white rounded-lg shadow-md border border-gray-200
        transition-transform duration-150 ease-out
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Mobile-optimized modal with slide-up animation
 */
export function MobileModal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = '' 
}) {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!modalRef.current || !overlayRef.current) return

    if (isOpen) {
      // Animate modal in
      overlayRef.current.style.display = 'flex'
      cssAnimator.fadeIn(overlayRef.current, { duration: 200 })
      
      modalRef.current.style.transform = 'translateY(100%)'
      cssAnimator.animate(modalRef.current, {
        transform: 'translateY(0)'
      }, {
        duration: 300,
        easing: ANIMATION_CONFIG.EASING.EASE_OUT
      })
    } else {
      // Animate modal out
      cssAnimator.animate(modalRef.current, {
        transform: 'translateY(100%)'
      }, {
        duration: 250,
        easing: ANIMATION_CONFIG.EASING.EASE_IN
      })
      
      cssAnimator.fadeOut(overlayRef.current, { duration: 200 }).then(() => {
        overlayRef.current.style.display = 'none'
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-t-xl w-full max-w-lg max-h-[80vh] overflow-hidden
          transform transition-transform duration-300 ease-out
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Pull-to-refresh container
 */
export function PullToRefreshContainer({ 
  children, 
  onRefresh,
  className = '' 
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !onRefresh) return

    const cleanup = touchAnimator.setupPullToRefresh(containerRef.current, onRefresh)
    return cleanup
  }, [onRefresh])

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Responsive grid that adapts to screen size
 */
export function ResponsiveGrid({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '' 
}) {
  const [currentColumns, setCurrentColumns] = useState(1)

  useEffect(() => {
    const updateColumns = () => {
      const cols = responsiveAnimator.getResponsiveValue(columns)
      setCurrentColumns(cols)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [columns])

  return (
    <div
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Mobile-optimized navigation tabs
 */
export function MobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = '' 
}) {
  const tabsRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(() => {
    if (!indicatorRef.current || !tabsRef.current) return

    const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
    const tabElements = tabsRef.current.children
    
    if (tabElements[activeIndex]) {
      const activeElement = tabElements[activeIndex]
      const { offsetLeft, offsetWidth } = activeElement

      cssAnimator.animate(indicatorRef.current, {
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`
      }, {
        duration: 200,
        easing: ANIMATION_CONFIG.EASING.EASE_OUT
      })
    }
  }, [activeTab, tabs])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={tabsRef}
        className="flex bg-gray-100 rounded-lg p-1 relative overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 min-w-0 px-4 py-2 text-sm font-medium rounded-md
              transition-colors duration-150 whitespace-nowrap
              ${activeTab === tab.id 
                ? 'text-indigo-600 bg-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
        
        {/* Animated indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-1 left-1 h-[calc(100%-8px)] bg-white rounded-md shadow-sm transition-all duration-200 pointer-events-none"
          style={{ width: '0px' }}
        />
      </div>
    </div>
  )
}

/**
 * Touch-friendly accordion
 */
export function MobileAccordion({ 
  items, 
  allowMultiple = false,
  className = '' 
}) {
  const [openItems, setOpenItems] = useState(new Set())

  const toggleItem = (itemId) => {
    const newOpenItems = new Set(openItems)
    
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId)
    } else {
      if (!allowMultiple) {
        newOpenItems.clear()
      }
      newOpenItems.add(itemId)
    }
    
    setOpenItems(newOpenItems)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  )
}

function AccordionItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return

    if (isOpen) {
      cssAnimator.slideDown(contentRef.current, { duration: 250 })
    } else {
      cssAnimator.slideUp(contentRef.current, { duration: 200 })
    }
  }, [isOpen])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <MobileButton
        onClick={onToggle}
        variant="secondary"
        className="w-full text-left flex items-center justify-between p-4 bg-transparent border-0 rounded-none"
      >
        <span className="font-medium">{item.title}</span>
        <span className={`transform transition-transform duration-200 ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}>
          ▼
        </span>
      </MobileButton>
      
      {isOpen && (
        <div ref={contentRef} className="overflow-hidden">
          <div className="p-4 pt-0 text-gray-600">
            {item.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default {
  MobileButton,
  SwipeableCard,
  MobileModal,
  PullToRefreshContainer,
  ResponsiveGrid,
  MobileTabs,
  MobileAccordion
}
