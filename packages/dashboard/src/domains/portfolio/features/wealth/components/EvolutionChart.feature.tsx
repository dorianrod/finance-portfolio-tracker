import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import {
  type ChartScaleMode,
  ChartScaleToggle,
} from '@/shared/ui/ChartScaleToggle.view'

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
    <div className="bg-surface rounded-xl p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-content-muted">
          {title}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.evolutionchart.portfolioMarketValueOverTimeSplitBetweenCostBasis',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </h2>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          key={scale}
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={SEMANTIC_COLORS.costBasis}
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor={SEMANTIC_COLORS.costBasis}
                stopOpacity={0.2}
              />
            </linearGradient>
            <linearGradient id="gradGain" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={SEMANTIC_COLORS.performancePositive}
                stopOpacity={0.7}
              />
              <stop
                offset="95%"
                stopColor={SEMANTIC_COLORS.performancePositive}
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={
              percentageMode
                ? (value) => `${Math.round(Number(value))}%`
                : (value) => formatMoney(value, { style: 'compact' })
            }
            domain={percentageMode ? ['auto', 'auto'] : undefined}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={percentageMode ? 48 : 52}
          />
          <Tooltip
            content={<EvolutionTooltip percentageMode={percentageMode} />}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
                {value === 'Cost basis'
                  ? i18n.t('ui.evolutionchart.costBasis')
                  : i18n.t('ui.evolutionchart.unrealizedPL')}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey={
              percentageMode ? PORTFOLIO_COST_SHARE_KEY : 'total_cost_basis'
            }
            name={i18n.t('ui.evolutionchart.costBasis')}
            stackId="a"
            stroke={SEMANTIC_COLORS.costBasis}
            fill="url(#gradCost)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey={
              percentageMode ? PORTFOLIO_GAIN_SHARE_KEY : 'unrealized_gain'
            }
            name={i18n.t('ui.evolutionchart.unrealizedPL')}
            stackId="a"
            stroke={SEMANTIC_COLORS.performancePositive}
            fill="url(#gradGain)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
