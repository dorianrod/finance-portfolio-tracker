import { useMemo, useState } from 'react'
import { AreaChart, Legend, ResponsiveContainer, Tooltip } from 'recharts'

import {
  PORTFOLIO_COST_SHARE_KEY,
  PORTFOLIO_GAIN_SHARE_KEY,
  withPortfolioComposition,
} from '@/domains/portfolio/features/wealth/helpers/mappers/buildChartScaleData'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { EvolutionTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import {
  type ChartScaleMode,
  ChartScaleToggle,
} from '@/shared/ui/ChartScaleToggle.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function EvolutionChart({
  history,
  title = i18n.t('ui.evolutionchart.portfolioValueOverTime'),
  height = 220,
}: {
  history: PortfolioHistoryPoint[]
  title?: string
  height?: number
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(() => withPortfolioComposition(history), [history])

  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Text
          as="h2"
          variant="label"
          tone="muted"
          className="flex items-center"
        >
          {title}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.evolutionchart.portfolioMarketValueOverTimeSplitBetweenCostBasis',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </Text>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          key={scale}
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <SeriesGradient id="gradCost" profile="base" tone="costBasis" />
            <SeriesGradient
              id="gradGain"
              profile="strong"
              tone="performancePositive"
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
                ? (value) => `${Math.round(Number(value))}%`
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
            tone="costBasis"
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
            tone="performancePositive"
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
