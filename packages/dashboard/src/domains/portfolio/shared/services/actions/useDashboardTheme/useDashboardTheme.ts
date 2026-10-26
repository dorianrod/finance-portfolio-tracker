import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardThemeAtom } from '@/domains/portfolio/shared/stores/dashboardTheme/dashboardThemeAtom'

export function useDashboardTheme() {
  const setTheme = useSetAtom(dashboardThemeAtom)

  const toggleTheme = useCallback(
    () => setTheme((value) => (value === 'dark' ? 'light' : 'dark')),
    [setTheme],
  )

  return useMemo(() => ({ toggleTheme }), [toggleTheme])
}
