import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import type { TrendTooltipProps } from './concentrationTrendTooltips.types'
import { ThresholdRow } from './ThresholdRow.view'

export function ConcentrationTrendTooltip({
  active,
  payload,
}: TrendTooltipProps) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0].payload
  return (
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {formatDate(row.date, { style: 'shortMonthShortYear' })}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipDim'} variant="caption">
          {i18n.t('ui.concentrationtrendsection.coverageWithValues', {
            percentage: formatPercentage(row.coveragePct),
          })}
        </ChartText>
      </Layout>
      <Layout spaceBefore="default">
        <ChartText as="div" tone={'tooltipLabel'}>
          <Stack gap="compact">
            <ThresholdRow
              label="25%"
              tone={PORTFOLIO_CHART_TONES.risk}
              value={row.positionsTo25Pct}
              delta={row.positionsTo25Delta}
            />
            <ThresholdRow
              label="50%"
              tone={PORTFOLIO_CHART_TONES.totalChange}
              value={row.positionsTo50Pct}
              delta={row.positionsTo50Delta}
            />
            <ThresholdRow
              label="75%"
              tone={PORTFOLIO_CHART_TONES.netContributions}
              value={row.positionsTo75Pct}
              delta={row.positionsTo75Delta}
            />
            <ThresholdRow
              label="90%"
              tone={PORTFOLIO_CHART_TONES.portfolioValue}
              value={row.positionsTo90Pct}
              delta={row.positionsTo90Delta}
            />
          </Stack>
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}
