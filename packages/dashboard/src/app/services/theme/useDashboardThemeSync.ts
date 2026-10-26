import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { dashboardThemeAtom } from '@/app/stores/theme/dashboardThemeAtom'
import { PAGE_THEME_COLORS } from '@/shared/theme/pageThemeColors'

export function useDashboardThemeSync() {
  const theme = useAtomValue(dashboardThemeAtom)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', PAGE_THEME_COLORS[theme])
  }, [theme])
}
