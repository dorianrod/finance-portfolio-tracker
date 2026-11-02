import { useCallback } from 'react'

import { CompactDataQualityKpiView } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.view'
import { normalizeCoveragePercentage } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/normalizeCoveragePercentage'
import { useFormatAnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatAnalysisReliabilityTone'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function AnalysisReliabilityKpi({
  percentage,
  amount,
  metricLabel,
  tone,
  tooltip,
  qualityTheme,
  scope,
}: {
  // Loading or unavailable analysis has no measured reliability percentage.
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
  tooltip: string
  qualityTheme: QualityThemeId
  scope: FilterScopeSpec
}) {
  const { openDataQuality } = useQualityNavigation()
  const handleOpenQuality = useCallback(
    () => openDataQuality(qualityTheme),
    [openDataQuality, qualityTheme],
  )
  const formatReliabilityTone = useFormatAnalysisReliabilityTone()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage = normalizeCoveragePercentage(percentage)
  const percentageLabel = formatPercentage(safePercentage)

  return (
    <CompactDataQualityKpiView
      tone={tone}
      tooltip={tooltip}
      rows={[
        {
          label: metricLabel,
          value: percentageLabel,
          secondary: i18n.t('ui.analysisreliabilitykpi.analyzedAmount', {
            amount: formatMoney(amount, { style: 'full' }),
          }),
          tone,
        },
      ]}
      onOpenQuality={handleOpenQuality}
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1Value2OpenDataQuality',
        {
          value0: formatReliabilityTone(tone),
          value1: percentageLabel,
          value2: metricLabel,
        },
      )}
    >
      <FilterScopeBadges {...scope} />
    </CompactDataQualityKpiView>
  )
}
