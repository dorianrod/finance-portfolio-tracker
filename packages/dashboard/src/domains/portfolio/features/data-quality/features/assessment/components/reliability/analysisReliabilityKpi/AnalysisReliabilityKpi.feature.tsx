import { CompactDataQualityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.feature'
import { normalizeCoveragePercentage } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/normalizeCoveragePercentage'
import { useFormatAnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatAnalysisReliabilityTone'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
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
  const formatReliabilityTone = useFormatAnalysisReliabilityTone()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage = normalizeCoveragePercentage(percentage)
  const percentageLabel = formatPercentage(safePercentage)

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter normalizes and formats its coverage metric; CompactDataQualityKpi renders the rows and owns quality navigation and live filter badges.
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
      qualityTheme={qualityTheme}
      scope={scope}
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter translates the summary of its own metric values; CompactDataQualityKpi passes that display-ready label to the shared button.
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1Value2OpenDataQuality',
        {
          value0: formatReliabilityTone(tone),
          value1: percentageLabel,
          value2: metricLabel,
        },
      )}
    />
  )
}
