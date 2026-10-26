import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/shared/stores/dashboardQuality.atoms'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'

export function useDashboardQuality() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  const setSelectedQualityTheme = useSetAtom(dashboardSelectedQualityThemeAtom)

  const openDataQuality = useCallback(
    (theme: QualityThemeId) => {
      setSelectedQualityTheme(theme)
      setActiveTab('quality')
    },
    [setActiveTab, setSelectedQualityTheme],
  )
  const openQualityOverview = useCallback(() => {
    setSelectedQualityTheme(null)
    setActiveTab('quality')
  }, [setActiveTab, setSelectedQualityTheme])

  return useMemo(
    () => ({ openDataQuality, openQualityOverview, setSelectedQualityTheme }),
    [openDataQuality, openQualityOverview, setSelectedQualityTheme],
  )
}
