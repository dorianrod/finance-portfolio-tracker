import { useCallback, useEffect, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { dashboardThemeAtom } from '@/domains/portfolio/shared/stores/dashboardTheme.atoms'

const THEME_STORAGE_KEY = 'finance-dashboard-theme'

export function useDashboardTheme() {
  const setTheme = useSetAtom(dashboardThemeAtom)

  const toggleTheme = useCallback(
    () => setTheme((value) => value === 'dark' ? 'light' : 'dark'),
    [setTheme],
  )

  return useMemo(() => ({ toggleTheme }), [toggleTheme])
}

export function useDashboardThemeSync() {
  const theme = useAtomValue(dashboardThemeAtom)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage can be unavailable in hardened/private browser contexts.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#111827' : '#f9fafb',
    )
  }, [theme])
}
