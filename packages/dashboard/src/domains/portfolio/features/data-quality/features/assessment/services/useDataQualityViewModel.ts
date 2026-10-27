import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useBuildDataQualityViewModel } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/useBuildDataQualityViewModel'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/services/actions/useQualityNavigation'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dashboardQuality.atoms'
import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

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

type DataQualityViewModelInput = {
  positions: PositionRow[]
  errors: PipelineError[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
  rawData: RawIsinData
}
