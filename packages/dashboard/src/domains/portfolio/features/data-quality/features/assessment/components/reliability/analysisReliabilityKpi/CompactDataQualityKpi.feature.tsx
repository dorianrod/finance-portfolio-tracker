import { useCallback } from 'react'

import type { QualityTooltipRow } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/types/qualityTooltipRow.type'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import {
  FilterScopeBadges,
  type FilterScopeSpec,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'

import { CompactDataQualityKpiView } from './CompactDataQualityKpi.view'

export function CompactDataQualityKpi({
  tone,
  tooltip,
  rows,
  ariaLabel,
  qualityTheme,
  scope,
}: {
  tone: AnalysisReliabilityTone
  tooltip: string
  rows: QualityTooltipRow[]
  ariaLabel: string
  qualityTheme: QualityThemeId
  scope: FilterScopeSpec
}) {
  const { openDataQuality } = useQualityNavigation()
  const handleClick = useCallback(
    () => openDataQuality(qualityTheme),
    [openDataQuality, qualityTheme],
  )
  return (
    <CompactDataQualityKpiView
      tone={tone}
      tooltip={tooltip}
      rows={rows}
      ariaLabel={ariaLabel}
      onOpenQuality={handleClick}
    >
      <FilterScopeBadges {...scope} />
    </CompactDataQualityKpiView>
  )
}
