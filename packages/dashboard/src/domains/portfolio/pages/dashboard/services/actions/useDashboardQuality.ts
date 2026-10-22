import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { dashboardActiveTabAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardQuality.atoms'
import type { QualityThemeId } from '@/domains/portfolio/types/quality'

export function useDashboardQuality() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  const setSelectedQualityTheme = useSetAtom(dashboardSelectedQualityThemeAtom)

  const openDataQuality = useCallback((theme: QualityThemeId) => {
    setSelectedQualityTheme(theme)
    setActiveTab('quality')
  }, [setActiveTab, setSelectedQualityTheme])
  const openQualityOverview = useCallback(() => {
    setSelectedQualityTheme(null)
    setActiveTab('quality')
  }, [setActiveTab, setSelectedQualityTheme])

  return useMemo(
    () => ({ openDataQuality, openQualityOverview, setSelectedQualityTheme }),
    [openDataQuality, openQualityOverview, setSelectedQualityTheme],
  )
}
