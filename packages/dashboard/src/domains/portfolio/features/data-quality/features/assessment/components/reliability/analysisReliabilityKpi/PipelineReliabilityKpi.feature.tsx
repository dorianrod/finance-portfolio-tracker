import { useCallback } from 'react'

import { CompactDataQualityKpiView } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CompactDataQualityKpi.view'
import { useFormatAnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatAnalysisReliabilityTone'
import { useFormatPipelineStatus } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatPipelineStatus'
import { pipelineReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/pipelineReliabilityTone'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
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
  const { openDataQuality } = useQualityNavigation()
  const handleOpenQuality = useCallback(
    () => openDataQuality('pipeline'),
    [openDataQuality],
  )
  const formatReliabilityTone = useFormatAnalysisReliabilityTone()
  const formatPipelineStatus = useFormatPipelineStatus()
  const tone = pipelineReliabilityTone({ errorCount, warningCount, loading })
  const statusLabel = formatPipelineStatus({
    errorCount,
    warningCount,
    loading,
  })

  return (
    <CompactDataQualityKpiView
      tone={tone}
      tooltip={i18n.t(
        'ui.analysisreliabilitykpi.importPositionAndMarketDataAnomaliesRelevantToThe',
      )}
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
      onOpenQuality={handleOpenQuality}
      ariaLabel={i18n.t(
        'ui.analysisreliabilitykpi.dataQualityValue0Value1ErrorsAndValue2WarningsIn',
        {
          value0: formatReliabilityTone(tone),
          value1: errorCount,
          value2: warningCount,
        },
      )}
    >
      <FilterScopeBadges {...scope} />
    </CompactDataQualityKpiView>
  )
}
