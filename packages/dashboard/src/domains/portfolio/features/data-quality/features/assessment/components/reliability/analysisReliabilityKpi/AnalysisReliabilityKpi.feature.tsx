import { CompactDataQualityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.feature'
import { RELIABILITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/analysisReliability.types'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import { type FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
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
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
  tooltip: string
  qualityTheme: QualityThemeId
  scope: FilterScopeSpec
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage =
    percentage == null || !Number.isFinite(percentage)
      ? null
      : Math.max(0, Math.min(100, percentage))
  const styles = RELIABILITY_TONES[tone]
  const percentageLabel = formatPercentage(safePercentage)

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns the normalized visual metric rows.
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
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns its composed accessible summary.
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1Value2OpenDataQuality',
        {
          value0: styles.label,
          value1: percentageLabel,
          value2: metricLabel,
        },
      )}
    />
  )
}
