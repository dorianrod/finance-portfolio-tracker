import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/shared/stores/dashboardQuality.atoms'
import { buildDataQualityViewModel } from '../helpers/mappers/buildDataQualityViewModel'

interface DataQualityViewModelInput {
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
  const formatPercentage = useFormatPercentage()
  const selectedTheme = useAtomValue(dashboardSelectedQualityThemeAtom)
  const { setSelectedQualityTheme } = useDashboardQuality()
  const viewModel = useMemo(
    () => buildDataQualityViewModel({
      positions,
      errors,
      manualPriceOverrides,
      fundStatuses,
      fundReport,
      fundHoldings,
      fundSnapshots,
      fundUnresolved,
      rawData,
      formatPercentage,
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
      formatPercentage,
    ],
  )
  const activeThemeId = selectedTheme ?? viewModel.recommendedTheme.id
  const activeTheme = viewModel.themes.find((theme) => theme.id === activeThemeId) ?? viewModel.themes[0]
  return { ...viewModel, activeTheme, activeThemeId, setSelectedQualityTheme }
}
