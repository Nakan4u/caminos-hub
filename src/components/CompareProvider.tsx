'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export const MAX_COMPARE = 4

interface CompareContextValue {
  selected: string[]
  isSelected: (slug: string) => boolean
  toggle: (slug: string) => void
  clear: () => void
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode
  initial?: string[]
}) {
  const [selected, setSelected] = useState<string[]>(initial)

  const toggle = useCallback((slug: string) => {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((entry) => entry !== slug)
        : current.length >= MAX_COMPARE
          ? current
          : [...current, slug],
    )
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const value = useMemo<CompareContextValue>(
    () => ({
      selected,
      isSelected: (slug) => selected.includes(slug),
      toggle,
      clear,
      isFull: selected.length >= MAX_COMPARE,
    }),
    [selected, toggle, clear],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used inside a CompareProvider')
  return context
}
