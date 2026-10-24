import { createPortal } from 'react-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  buildHoverChartSeries,
  computePosition,
  computeUnitPriceDomain,
  type Operation,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { BuySellDot, BuySellDotUnit } from './BuySellDots.view'
import { TooltipPortfolio, TooltipUnit } from './hoverCharts.tooltips.view'

export type ChartTarget = {
  isin: string
  name: string
  operations: Operation[]
  buttonRect: DOMRect
}

type Props = {
  target: ChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverChart({ target, onMouseEnter, onMouseLeave }: Props) {
  const formatMoney = useFormatMoney()
  const { data: history } = usePositionHistoryQuery(target.isin)
  const { top, left } = computePosition(target.buttonRect)

  const showUnitPrice =
    history != null &&
    history.some((p) => Math.abs(p.last_price - p.value) > 0.01)

  const chartData = history
    ? buildHoverChartSeries(history, target.operations)
    : undefined
  const unitPriceDomain = chartData
    ? computeUnitPriceDomain(chartData)
    : undefined
  const displayedChartData = chartData?.length ? chartData : null

  return createPortal(
    <div
      style={{ top, left, width: 600 }}
      className="fixed z-[9999] bg-surface border border-border-strong rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-content text-sm font-semibold">{target.name}</p>
        <p className="text-content-subtle text-xs font-mono">{target.isin}</p>
      </div>

      {!history && (
        <p className="text-content-muted text-xs py-4 text-center">
          {i18n.t('ui.hoverchart.loading')}
        </p>
      )}

      {displayedChartData && (
        <>
          {/* Chart 1: position value */}
          <p className="text-content-muted text-xs mb-1">
            {i18n.t('ui.hoverchart.positionValue')}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={displayedChartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={SEMANTIC_COLORS.portfolioValue}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={SEMANTIC_COLORS.portfolioValue}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatMoney(value)}
                width={64}
              />
              <Tooltip content={<TooltipPortfolio />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: CHART_THEME.tick }}
              />
              <Area
                type="monotone"
                dataKey="Cost basis"
                stroke={SEMANTIC_COLORS.costBasis}
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="4 2"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Value"
                stroke={SEMANTIC_COLORS.portfolioValue}
                strokeWidth={2}
                fill="url(#gVal)"
                dot={<BuySellDot />}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* legend markers */}
          <div className="flex gap-4 text-xs text-content-subtle mt-1 mb-3 ml-2">
            <span>
              <span
                className="mr-1 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: SEMANTIC_COLORS.transactionBuy }}
              />
              {i18n.t('ui.hoverchart.buy')}
            </span>
            <span>
              <span
                className="mr-1 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: SEMANTIC_COLORS.transactionSell }}
              />
              {i18n.t('ui.hoverchart.sell')}
            </span>
          </div>

          {/* Chart 2: unit price — only when real market data is available */}
          {showUnitPrice && (
            <>
              <p className="text-content-muted text-xs mb-1">
                {i18n.t('ui.hoverchart.unitPrice')}
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={displayedChartData}
                  margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_THEME.grid}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      formatMoney(value, { style: 'decimal' })
                    }
                    width={64}
                    domain={unitPriceDomain}
                  />
                  <Tooltip content={<TooltipUnit />} />
                  <Line
                    type="monotone"
                    dataKey="Unit price"
                    stroke={SEMANTIC_COLORS.returnRate}
                    strokeWidth={2}
                    dot={<BuySellDotUnit />}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>,
    document.body,
  )
}
