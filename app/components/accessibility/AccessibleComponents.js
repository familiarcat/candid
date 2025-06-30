// Accessible UI components with WCAG 2.1 AA compliance
// Provides fully accessible components for inclusive user experience

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { accessibilityManager, trapFocus, announceToScreenReader } from '../../lib/accessibilitySystem'

/**
 * Accessible Modal Dialog
 */
export const AccessibleModal = React.forwardRef(function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'medium',
  closeOnEscape = true,
  closeOnOverlay = true,
  initialFocus = null,
  ...props
}, ref) {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const previousFocus = useRef(null)
  const [trapFocusCleanup, setTrapFocusCleanup] = useState(null)

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocus.current = document.activeElement

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // Announce modal opening
      announceToScreenReader(`${title} dialog opened`)

      // Setup focus trap
      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current)
        setTrapFocusCleanup(() => cleanup)

        // Focus initial element or first focusable element
        setTimeout(() => {
          if (initialFocus && initialFocus.current) {
            initialFocus.current.focus()
          } else {
            const firstFocusable = modalRef.current.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (firstFocusable) {
              firstFocusable.focus()
            }
          }
        }, 100)
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = ''

      // Cleanup focus trap
      if (trapFocusCleanup) {
        trapFocusCleanup()
        setTrapFocusCleanup(null)
      }

      // Restore previous focus
      if (previousFocus.current) {
        previousFocus.current.focus()
        previousFocus.current = null
      }

      // Announce modal closing
      if (title) {
        announceToScreenReader(`${title} dialog closed`)
      }
    }

    return () => {
      if (trapFocusCleanup) {
        trapFocusCleanup()
      }
      document.body.style.overflow = ''
    }
  }, [isOpen, title, initialFocus, trapFocusCleanup])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      onClose()
    }
  }, [closeOnOverlay, onClose])

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4'
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label={`Close ${title} dialog`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
})

/**
 * Accessible Button with loading and disabled states
 */
export const AccessibleButton = React.forwardRef(function AccessibleButton({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  loadingText = 'Loading...',
  onClick,
  className = '',
  ...props
}, ref) {
  const isDisabled = disabled || loading

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  }

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }

  const handleClick = useCallback((e) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }, [isDisabled, onClick])

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={loading ? 'loading-description' : undefined}
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {loading ? loadingText : children}
      {loading && (
        <span id="loading-description" className="sr-only">
          Please wait while the action is being processed
        </span>
      )}
    </button>
  )
})

/**
 * Accessible Form Input with validation
 */
export const AccessibleInput = React.forwardRef(function AccessibleInput({
  label,
  error,
  help,
  required = false,
  type = 'text',
  className = '',
  ...props
}, ref) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${help ? helpId : ''}`.trim() || undefined}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
          }
        `}
        {...props}
      />
      
      {help && (
        <p id={helpId} className="text-sm text-gray-600">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

/**
 * Accessible Select Dropdown
 */
export const AccessibleSelect = React.forwardRef(function AccessibleSelect({
  label,
  options = [],
  error,
  help,
  required = false,
  placeholder = 'Select an option...',
  className = '',
  ...props
}, ref) {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${selectId}-error`
  const helpId = `${selectId}-help`

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${help ? helpId : ''}`.trim() || undefined}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error 
            ? 'border-red-300 text-red-900' 
            : 'border-gray-300 text-gray-900'
          }
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {help && (
        <p id={helpId} className="text-sm text-gray-600">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

/**
 * Accessible Checkbox with proper labeling
 */
export const AccessibleCheckbox = React.forwardRef(function AccessibleCheckbox({
  label,
  description,
  error,
  required = false,
  className = '',
  ...props
}, ref) {
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = `${checkboxId}-description`
  const errorId = `${checkboxId}-error`

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`.trim() || undefined}
          className={`
            mt-1 h-4 w-4 rounded border-gray-300 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            ${error ? 'border-red-300 text-red-600' : 'text-blue-600'}
          `}
          {...props}
        />
        <div className="ml-3">
          <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
          {description && (
            <p id={descriptionId} className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

/**
 * Accessible Alert/Notification
 */
export const AccessibleAlert = React.forwardRef(function AccessibleAlert({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
  ...props
}, ref) {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ'
    }
  }

  const config = types[type]

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className={`
        p-4 rounded-md border
        ${config.bg} ${config.border} ${config.text}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg" aria-hidden="true">
            {config.icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${config.text} hover:bg-opacity-20 focus:ring-offset-${type === 'warning' ? 'yellow' : type}-50
              `}
              aria-label={`Close ${type} alert`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

export default {
  AccessibleModal,
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleAlert
}
