import { useCallback } from 'react'

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
import { Button } from '@/shared/ui/Controls.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'
import { Tooltip } from '@/shared/ui/Tooltip.view'

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
  const styles = RELIABILITY_TONES[tone]

  return (
    <Surface
      variant="qualityAction"
      className="relative inline-flex items-center"
    >
      <Button
        type="button"
        onClick={handleClick}
        variant="qualityAction"
        className="inline-flex items-center gap-2 py-1 pl-0 pr-1"
        label={ariaLabel}
      >
        <Text variant="prominentEyebrow" tone="subtle">
          {i18n.t('ui.analysisreliabilitykpi.dataQuality')}
        </Text>
        <ToneSwatch
          tone={styles.dot}
          shape="dot"
          className="h-2 w-2 shrink-0"
        />
        <Text variant="eyebrow" tone={styles.status}>
          {styles.label}
        </Text>
      </Button>
      <Tooltip>
        <Tooltip.Trigger
          variant="help"
          className="p-1"
          label={i18n.t('ui.analysisreliabilitykpi.showDataQualityDetails')}
        >
          <InfoIcon />
        </Tooltip.Trigger>
        <Tooltip.Content
          align="start"
          variant="left"
          className="w-[min(22rem,calc(100vw-2rem))]"
        >
          <Text variant="note" tone="muted" className="block">
            {tooltip}
          </Text>
          <Surface
            as="span"
            variant="sectionStart"
            className="mt-2.5 block pt-2"
          >
            <Text variant="eyebrow" tone="subtle" className="block">
              {i18n.t('ui.analysisreliabilitykpi.filterScope')}
            </Text>
            <FilterScopeBadges {...scope} />
          </Surface>
          <Surface as="span" variant="sectionStart" className="mt-3 block pt-1">
            {rows.map((row) => (
              <QualityTooltipMetricRow key={row.label} row={row} />
            ))}
          </Surface>
        </Tooltip.Content>
      </Tooltip>
    </Surface>
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
