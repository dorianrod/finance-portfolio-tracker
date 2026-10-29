import { CompactDataQualityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.feature'
import { normalizeCoveragePercentage } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/normalizeCoveragePercentage'
import { RELIABILITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import type { QualityTooltipRow } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/types/qualityTooltipRow.type'
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
  const { metrics, statusMetric, tone, tooltip, qualityTheme, scope } =
    useCombinedReliabilityPresentation(props)
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const styles = RELIABILITY_TONES[tone]
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
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}

      rows={rows}
      qualityTheme={qualityTheme}
      scope={scope}

      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1OpenDataQuality',
        {
          value0: styles.label,
          value1: metricSummary,
        },
      )}
    />
  )
}
