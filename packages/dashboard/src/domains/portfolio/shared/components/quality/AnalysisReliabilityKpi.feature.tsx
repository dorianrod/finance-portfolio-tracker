import { useCallback, useId } from 'react'

import {
  FilterScopeBadges,
  type FilterScopeSpec,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import {
  type AnalysisReliabilityMetric,
  type AnalysisReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
  type StatusReliabilityMetric,
} from '@/domains/portfolio/shared/helpers/quality/analysisReliability'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from './helpers/presenters/qualityReliabilityPresentation'
import { InfoIcon, QualityTooltipMetricRow } from './QualityTooltipDetails.view'

function CompactDataQualityKpi({
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
  const { openDataQuality } = useDashboardQuality()
  const handleClick = useCallback(
    () => openDataQuality(qualityTheme),
    [openDataQuality, qualityTheme],
  )
  const tooltipId = useId()
  const styles = RELIABILITY_TONES[tone]

  return (
    <div className="data-quality-kpi relative inline-flex items-center rounded-md transition-colors hover:bg-surface/60">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-l-md py-1 pl-0 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
        aria-label={ariaLabel}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-content-subtle">
          {i18n.t('ui.analysisreliabilitykpi.dataQuality')}
        </span>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
          aria-hidden="true"
        />
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}
        >
          {styles.label}
        </span>
      </button>
      <button
        type="button"
        className="data-quality-help rounded-r-md p-1 text-content-subtle transition-colors hover:text-content-muted focus-visible:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70"
        aria-label={i18n.t('ui.analysisreliabilitykpi.showDataQualityDetails')}
        aria-describedby={tooltipId}
      >
        <InfoIcon />
        <span
          id={tooltipId}
          role="tooltip"
          className="data-quality-tooltip pointer-events-none invisible absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border-strong bg-surface p-3 text-left opacity-0 shadow-xl transition-[opacity,visibility] duration-150"
        >
          <span className="block text-xs leading-relaxed text-content-muted">
            {tooltip}
          </span>
          <span className="mt-2.5 block border-t border-border pt-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
              {i18n.t('ui.analysisreliabilitykpi.filterScope')}
            </span>
            <FilterScopeBadges {...scope} />
          </span>
          <span className="mt-3 block border-t border-border pt-1">
            {rows.map((row) => (
              <QualityTooltipMetricRow key={row.label} row={row} />
            ))}
          </span>
        </span>
      </button>
    </div>
  )
}

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
      value:
        metric.percentage == null || !Number.isFinite(metric.percentage)
          ? '—'
          : formatPercentage(Math.max(0, Math.min(100, metric.percentage))),
      secondary: i18n.t('ui.analysisreliabilitykpi.analyzedAmount', {
        amount: formatMoney(metric.amount, { style: 'full' }),
      }),
      tone: metric.tone,
    })),
  ]
  const metricSummary = rows
    .map((row) => `${row.value} ${row.label}`)
    .join('; ')

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns the combined visual metric rows.
      rows={rows}
      qualityTheme={qualityTheme}
      scope={scope}
      // eslint-disable-next-line local/no-prop-drilling -- This feature owns its composed accessible summary.
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
