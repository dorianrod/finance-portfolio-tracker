import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dashboardQuality.atoms'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'

export function useQualityNavigation() {
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
