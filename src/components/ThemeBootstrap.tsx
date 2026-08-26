'use client'

import { useEffect } from 'react'
import { setThemeCookie } from '@/lib/theme'

/**
 * Renders only on a visitor's first-ever request (no theme cookie yet).
 * Runs after hydration, so it never causes a hydration mismatch — it just
 * upgrades the server's 'light' default to the OS preference and remembers
 * it for every request after this one.
 */
export function ThemeBootstrap() {
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
    setThemeCookie(prefersDark ? 'dark' : 'light')
  }, [])

  return null
}
