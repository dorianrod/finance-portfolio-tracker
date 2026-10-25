import {
  Bar,
  type BarShapeProps,
  CartesianGrid,
  ComposedChart,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

import {
  type UnrealizedPnlPoint,
  UnrealizedPnlTooltip,
} from './UnrealizedPnlTooltip.view'

export function UnrealizedPnlChart({
  history,
}: {
  history: PortfolioHistoryPoint[]
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const data: UnrealizedPnlPoint[] = history.map((point, index) => ({
    ...point,
    unrealized_gain_pct:
      point.total_cost_basis > 0
        ? (point.unrealized_gain / point.total_cost_basis) * 100
        : null,
    snapshot_change:
      index > 0
        ? point.unrealized_gain - history[index - 1].unrealized_gain
        : null,
  }))

  if (data.length === 0) return null

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-content-secondary">
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandlOverTime')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </h2>
        <p className="mt-0.5 text-xs text-content-subtle">
          {i18n.t(
            'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
          )}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            vertical={false}
          />
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
            yAxisId="amount"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tickFormatter={(value: number) =>
              formatPercentage(value, { decimals: 0 })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <ReferenceLine yAxisId="amount" y={0} stroke={CHART_THEME.zeroLine} />
          <Tooltip
            content={<UnrealizedPnlTooltip />}
            cursor={{ fill: CHART_THEME.cursor }}
          />
          <Bar
            yAxisId="amount"
            dataKey="unrealized_gain"
            maxBarSize={24}
            radius={3}
            isAnimationActive={false}
            shape={(
              shapeProps: ChartShapeProps<BarShapeProps, UnrealizedPnlPoint>,
            ) => {
              const point = shapeProps.payload
              if (!point) return null
              return (
                <Rectangle
                  {...shapeProps}
                  fill={
                    point.unrealized_gain >= 0
                      ? SEMANTIC_COLORS.performancePositive
                      : SEMANTIC_COLORS.performanceNegative
                  }
                />
              )
            }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="unrealized_gain_pct"
            stroke={SEMANTIC_COLORS.returnRate}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-subtle">
        <span>
          <i
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: SEMANTIC_COLORS.performancePositive }}
          />
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedGain')}
        </span>
        <span>
          <i
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: SEMANTIC_COLORS.performanceNegative }}
          />
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedLoss')}
        </span>
        <span>
          <i
            className="mr-1.5 inline-block h-0.5 w-3 align-middle"
            style={{ backgroundColor: SEMANTIC_COLORS.returnRate }}
          />
          {i18n.t('ui.unrealizedpnlchart.pandlCapitalPlaced')}
        </span>
      </div>
    </div>
  )
}
