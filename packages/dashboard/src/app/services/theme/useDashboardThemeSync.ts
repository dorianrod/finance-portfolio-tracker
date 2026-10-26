import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { dashboardThemeAtom } from '@/app/stores/theme/dashboardThemeAtom'

export function useDashboardThemeSync() {
  const theme = useAtomValue(dashboardThemeAtom)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111827' : '#f9fafb')
  }, [theme])
}
