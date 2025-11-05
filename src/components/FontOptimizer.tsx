'use client'

import * as React from 'react'

/**
 * FontOptimizer component to manage font loading and reduce preload warnings
 * This component helps optimize font loading performance by ensuring fonts are used
 */
function FontOptimizerComponent() {
  React.useEffect(() => {
    // Force usage of Inter font to prevent preload warnings
    const createFontUsage = () => {
      // Create a temporary element to force font usage
      const tempElement = document.createElement('div')
      tempElement.style.fontFamily = 'var(--font-inter), system-ui, sans-serif'
      tempElement.style.fontStyle = 'normal'
      tempElement.style.position = 'absolute'
      tempElement.style.visibility = 'hidden'
      tempElement.style.pointerEvents = 'none'
      tempElement.textContent = 'Font usage trigger'
      
      // Add to DOM temporarily
      document.body.appendChild(tempElement)
      
      // Force layout calculation
      tempElement.offsetHeight
      
      // Remove after forcing usage
      setTimeout(() => {
        document.body.removeChild(tempElement)
      }, 100)
    }

    // Run on component mount to trigger font usage
    createFontUsage()
    
    // Also run after a short delay to ensure proper font loading
    const timeoutId = setTimeout(createFontUsage, 500)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return null // This component doesn't render anything
}

// Use React.memo to prevent unnecessary re-renders and HMR issues
const FontOptimizer = React.memo(FontOptimizerComponent)
FontOptimizer.displayName = 'FontOptimizer'

export default FontOptimizer
