import { useCallback } from 'react'

import { CompactDataQualityKpiView } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.view'
import { normalizeCoveragePercentage } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/normalizeCoveragePercentage'
import type { QualityTooltipRow } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/types/qualityTooltipRow.type'
import { useFormatAnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatAnalysisReliabilityTone'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import {
  type CombinedReliabilityInput,
  useCombinedReliabilityPresentation,
} from './helpers/presenters/useCombinedReliabilityPresentation'

export function CombinedAnalysisReliabilityKpi(
  props: CombinedReliabilityInput,
) {
  const formatReliabilityTone = useFormatAnalysisReliabilityTone()
  const { metrics, statusMetric, tone, tooltip, qualityTheme, scope } =
    useCombinedReliabilityPresentation(props)
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { openDataQuality } = useQualityNavigation()
  const handleOpenQuality = useCallback(
    () => openDataQuality(qualityTheme),
    [openDataQuality, qualityTheme],
  )
  const rows: QualityTooltipRow[] = [
    ...(statusMetric
      ? [
          {
            label: statusMetric.metricLabel,
            value: statusMetric.value,
            tone: statusMetric.tone,
          },
        ]
      : []),
    ...metrics.map((metric) => ({
      label: metric.metricLabel,
      value: formatPercentage(normalizeCoveragePercentage(metric.percentage)),
      secondary: i18n.t('ui.analysisreliabilitykpi.analyzedAmount', {
        amount: formatMoney(metric.amount, { style: 'full' }),
      }),
      tone: metric.tone,
    })),
  ]
  const metricSummary = rows
    .map((row) =>
      i18n.t('ui.analysisreliabilitykpi.metricSummary', {
        value: row.value,
        label: row.label,
      }),
    )
    .join(i18n.t('ui.analysisreliabilitykpi.metricSeparator'))

  return (
    <CompactDataQualityKpiView
      tone={tone}
      tooltip={tooltip}

      rows={rows}
      onOpenQuality={handleOpenQuality}

      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1OpenDataQuality',
        {
          value0: formatReliabilityTone(tone),
          value1: metricSummary,
        },
      )}
    >
      <FilterScopeBadges {...scope} />
    </CompactDataQualityKpiView>
  )
}
