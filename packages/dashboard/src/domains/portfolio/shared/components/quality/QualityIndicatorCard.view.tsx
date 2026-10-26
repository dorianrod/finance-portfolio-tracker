import type { ReactNode } from 'react'

import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Progress } from '@/shared/ui/Controls.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { Proportion } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

type QualityTone = 'neutral' | 'coverage' | 'warning' | 'error' | 'muted'

const TONES = {
  neutral: { text: 'accent', bar: PORTFOLIO_CHART_TONES.netContributions },
  coverage: { text: 'positive', bar: PORTFOLIO_CHART_TONES.coverage },
  warning: { text: 'warning', bar: PORTFOLIO_CHART_TONES.coverageGap },
  error: { text: 'negative', bar: PORTFOLIO_CHART_TONES.performanceNegative },
  muted: { text: 'muted', bar: PORTFOLIO_CHART_TONES.mutedIndicator },
} as const

export function QualityIndicatorCard({
  label,
  tooltip,
  amount,
  percentage,
  detail,
  tone = 'neutral',
  children,
}: {
  label: string
  tooltip: string
  amount: number
  percentage: number
  detail?: string
  tone?: QualityTone
  children?: ReactNode
}) {
  const { slot: footer, content } = partitionSlot(children, InfoTooltip.Footer)
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage = Number.isFinite(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0
  const percentageLabel = formatPercentage(safePercentage)
  const colors = TONES[tone]

  return (
    <Surface variant="indicatorCard">
      <Text as="div" variant="captionLabel" tone="muted">
        <Inline as="div" align="center">
          <span>{label}</span>
          <InfoTooltip text={tooltip}>{footer}</InfoTooltip>
        </Inline>
      </Text>
      <Inline
        as="div"
        spaceBefore="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text variant="metricSecondary" tone={colors.text} numeric>
          {percentageLabel}
        </Text>
        <Text variant="caption" tone="subtle" numeric>
          {formatMoney(amount, { style: 'full' })}
        </Text>
      </Inline>
      <Layout spaceBefore="default" height="track" overflow="clip">
        <Progress variant="track" label={label} value={safePercentage}>
          <Proportion value={safePercentage}>
            <SeriesSwatch as="div" shape="dot" tone={colors.bar} />
          </Proportion>
        </Progress>
      </Layout>
      {detail && (
        <Layout spaceBefore="default">
          <Text as="div" variant="caption" tone="subtle">
            {detail}
          </Text>
        </Layout>
      )}
      {content}
    </Surface>
  )
}

QualityIndicatorCard.TooltipFooter = InfoTooltip.Footer
