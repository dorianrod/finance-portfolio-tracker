import { CompactDataQualityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.feature'
import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import { normalizeCoveragePercentage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/presenters/normalizeCoveragePercentage'
import type {
  AnalysisReliabilityMetric,
  AnalysisReliabilityTone,
  StatusReliabilityMetric,
} from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/analysisReliability.types'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import { type FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function CombinedAnalysisReliabilityKpi({
  metrics,
  statusMetric,
  tone,
  tooltip,
  qualityTheme,
  scope,
}: {
  metrics: AnalysisReliabilityMetric[]
  statusMetric?: StatusReliabilityMetric
  tone: AnalysisReliabilityTone
  tooltip: string
  qualityTheme: QualityThemeId
  scope: FilterScopeSpec
}) {
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
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter formats its combined reliability metrics; CompactDataQualityKpi renders the rows and owns quality navigation and live filter badges.
      rows={rows}
      qualityTheme={qualityTheme}
      scope={scope}
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter translates the summary of its own metric values; CompactDataQualityKpi passes that display-ready label to the shared button.
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
