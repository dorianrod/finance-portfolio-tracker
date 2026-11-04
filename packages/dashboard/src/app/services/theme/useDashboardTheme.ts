import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardThemeAtom } from '@/app/stores/theme/dashboardTheme.store'

export function useDashboardTheme() {
  const setTheme = useSetAtom(dashboardThemeAtom)

  const toggleTheme = useCallback(
    () => setTheme((value) => (value === 'dark' ? 'light' : 'dark')),
    [setTheme],
  )

  return useMemo(() => ({ toggleTheme }), [toggleTheme])
}
