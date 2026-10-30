import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useBuildDataQualityViewModel } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/presenters/useBuildDataQualityViewModel'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dashboardQuality.atoms'

export function useDataQualityViewModel({
  positions,
  errors,
  manualPriceOverrides,
  fundStatuses,
  fundReport,
  fundHoldings,
  fundSnapshots,
  fundUnresolved,
  rawData,
}: DataQualityViewModelInput) {
  const buildDataQualityViewModel = useBuildDataQualityViewModel()
  const selectedTheme = useAtomValue(dashboardSelectedQualityThemeAtom)
  const { setSelectedQualityTheme } = useQualityNavigation()
  const viewModel = useMemo(
    () =>
      buildDataQualityViewModel({
        positions,
        errors,
        manualPriceOverrides,
        fundStatuses,
        fundReport,
        fundHoldings,
        fundSnapshots,
        fundUnresolved,
        rawData,
      }),
    [
      positions,
      errors,
      manualPriceOverrides,
      fundStatuses,
      fundReport,
      fundHoldings,
      fundSnapshots,
      fundUnresolved,
      rawData,
      buildDataQualityViewModel,
    ],
  )
  const activeThemeId = selectedTheme ?? viewModel.recommendedTheme.id
  const activeTheme =
    viewModel.themes.find((theme) => theme.id === activeThemeId) ??
    viewModel.themes[0]
  return useMemo(
    () => ({
      ...viewModel,
      activeTheme,
      activeThemeId,
      setSelectedQualityTheme,
    }),
    [viewModel, activeTheme, activeThemeId, setSelectedQualityTheme],
  )
}

type DataQualityViewModelInput = Parameters<
  ReturnType<typeof useBuildDataQualityViewModel>
>[0]
