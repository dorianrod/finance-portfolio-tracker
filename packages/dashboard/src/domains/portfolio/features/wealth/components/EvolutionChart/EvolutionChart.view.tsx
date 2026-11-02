import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { AreaChart, Legend, ResponsiveContainer, Tooltip } from 'recharts'

import { PORTFOLIO_COST_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioGainShareKey'
import { EvolutionTooltip } from '@/domains/portfolio/features/wealth/components/EvolutionChart/EvolutionTooltip.view'
import { withPortfolioComposition } from '@/domains/portfolio/features/wealth/components/EvolutionChart/helpers/presenters/withPortfolioComposition'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import {
  type ChartScaleMode,
  ChartScaleToggle,
} from '@/shared/ui/ChartScaleToggle.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import type { PortfolioCompositionPoint } from './types/portfolioCompositionPoint.type'

export function EvolutionChartView({
  history,
  children,
  title = i18n.t('ui.evolutionchart.portfolioValueOverTime'),
  height = 220,
}: {
  history: PortfolioCompositionPoint[]
  children: ReactNode
  title?: string
  height?: number
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(() => withPortfolioComposition(history), [history])

  return (
    <Surface variant="chart">
      <Inline
        as="div"
        spaceAfter="default"
        align="start"
        justify="between"
        gap="default"
      >
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {title}
            {children}
          </Inline>
        </Text>
        <ChartScaleToggle valueLabel="€" value={scale} onChange={setScale} />
      </Inline>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          key={scale}
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <SeriesGradient
              id="gradCost"
              profile="base"
              tone={PORTFOLIO_CHART_TONES.costBasis}
            />
            <SeriesGradient
              id="gradGain"
              profile="strong"
              tone={PORTFOLIO_CHART_TONES.performancePositive}
            />
          </defs>
          <ChartGrid />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
            interval="preserveStartEnd"
          />
          <ChartYAxis
            tickFormatter={
              percentageMode
                ? (value) =>
                    formatPercentage(Math.round(value), { decimals: 0 })
                : (value) => formatMoney(value, { style: 'compact' })
            }
            domain={percentageMode ? ['auto', 'auto'] : undefined}
            width={percentageMode ? 48 : 52}
          />
          <Tooltip
            content={<EvolutionTooltip percentageMode={percentageMode} />}
          />
          <Legend formatter={EvolutionLegendLabel} />
          <SeriesArea
            type="monotone"
            dataKey={
              percentageMode ? PORTFOLIO_COST_SHARE_KEY : 'total_cost_basis'
            }
            name={i18n.t('ui.evolutionchart.costBasis')}
            stackId="a"
            tone={PORTFOLIO_CHART_TONES.costBasis}
            gradientId="gradCost"
            weight="fine"
          />
          <SeriesArea
            type="monotone"
            dataKey={
              percentageMode ? PORTFOLIO_GAIN_SHARE_KEY : 'unrealized_gain'
            }
            name={i18n.t('ui.evolutionchart.unrealizedPL')}
            stackId="a"
            tone={PORTFOLIO_CHART_TONES.performancePositive}
            gradientId="gradGain"
            weight="fine"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function EvolutionLegendLabel(value: string) {
  return (
    <ChartText tone={'tick'} variant="caption">
      {value === 'Cost basis'
        ? i18n.t('ui.evolutionchart.costBasis')
        : i18n.t('ui.evolutionchart.unrealizedPL')}
    </ChartText>
  )
}
