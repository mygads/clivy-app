import { Inter } from 'next/font/google'

// Use Google Fonts Inter to avoid local font preload warnings
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Optimize loading to reduce preload warnings
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

// Export the CSS variable for use in Tailwind
export const interClassName = inter.className
export const interVariable = inter.variable
