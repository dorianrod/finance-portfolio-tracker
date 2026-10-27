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
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter derives severity from pipeline counts and loading; CompactDataQualityKpi consumes that semantic tone for presentation and navigation.
      tone={tone}
      tooltip={i18n.t(
        'ui.analysisreliabilitykpi.importPositionAndMarketDataAnomaliesRelevantToThe',
      )}
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter formats pipeline status and issue counts; CompactDataQualityKpi renders the rows and owns quality navigation and live filter badges.
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
      // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This adapter translates the summary of its own metric values; CompactDataQualityKpi passes that display-ready label to the shared button.
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1ErrorsAndValue2WarningsIn',
        { value0: styles.label, value1: errorCount, value2: warningCount },
      )}
    />
  )
}
