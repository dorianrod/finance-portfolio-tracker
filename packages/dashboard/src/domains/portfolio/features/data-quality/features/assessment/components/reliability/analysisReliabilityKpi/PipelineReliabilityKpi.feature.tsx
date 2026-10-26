import { CompactDataQualityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.feature'
import { RELIABILITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import { pipelineReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/pipelineReliabilityTone'
import { pipelineStatusLabel } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/analysisReliability/pipelineStatusLabel'
import { type FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import i18n from '@/i18n/i18n'

export function PipelineReliabilityKpi({
  errorCount,
  warningCount,
  loading = false,
  scope,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
  scope: FilterScopeSpec
}) {
  const tone = pipelineReliabilityTone({ errorCount, warningCount, loading })
  const styles = RELIABILITY_TONES[tone]
  const statusLabel = pipelineStatusLabel({
    errorCount,
    warningCount,
    loading,
  })

  return (
    <CompactDataQualityKpi
      // eslint-disable-next-line local/no-prop-drilling -- Pipeline severity normalization belongs to this feature.
      tone={tone}
      tooltip={i18n.t(
        'ui.analysisreliabilitykpi.importPositionAndMarketDataAnomaliesRelevantToThe',
      )}
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns the normalized pipeline metric rows.
      rows={[
        {
          label: i18n.t('ui.analysisreliabilitykpi.portfolioData'),
          value: statusLabel,
          secondary: loading
            ? undefined
            : i18n.t('ui.analysisreliabilitykpi.errorWarningSummary', {
                errors: i18n.t('ui.analysisreliabilitykpi.errorCount', {
                  count: errorCount,
                }),
                warnings: i18n.t('ui.analysisreliabilitykpi.warningCount', {
                  count: warningCount,
                }),
              }),
          tone,
        },
      ]}
      qualityTheme="pipeline"
      scope={scope}
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns its composed accessible summary.
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1ErrorsAndValue2WarningsIn',
        { value0: styles.label, value1: errorCount, value2: warningCount },
      )}
    />
  )
}
