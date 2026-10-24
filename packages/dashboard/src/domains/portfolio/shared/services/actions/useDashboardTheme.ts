import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { dashboardThemeAtom } from '@/domains/portfolio/shared/stores/dashboardTheme.atoms'

export function useDashboardTheme() {
  const setTheme = useSetAtom(dashboardThemeAtom)

  const toggleTheme = useCallback(
    () => setTheme((value) => (value === 'dark' ? 'light' : 'dark')),
    [setTheme],
  )

  return useMemo(() => ({ toggleTheme }), [toggleTheme])
}

export function useDashboardThemeSync() {
  const theme = useAtomValue(dashboardThemeAtom)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111827' : '#f9fafb')
  }, [theme])
}
