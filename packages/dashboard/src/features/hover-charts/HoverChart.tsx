import { createPortal } from 'react-dom'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { fmt, fmtDec } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { usePositionsHistory } from '@/hooks/usePositionsHistory'
import { buildHoverChartSeries, computeUnitPriceDomain, computePosition, type Operation } from './hoverCharts.logic'
import { TooltipPortfolio, TooltipUnit } from './hoverCharts.tooltips'
import { BuySellDot, BuySellDotUnit } from './BuySellDots'

export interface ChartTarget {
  isin: string
  name: string
  operations: Operation[]
  buttonRect: DOMRect
}

interface Props {
  target: ChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverChart({ target, onMouseEnter, onMouseLeave }: Props) {
  const history = usePositionsHistory(target.isin)
  const { top, left } = computePosition(target.buttonRect)

  const showUnitPrice = history != null && history.some(p => Math.abs(p.last_price - p.value) > 0.01)

  const chartData = history ? buildHoverChartSeries(history, target.operations) : undefined
  const unitPriceDomain = chartData ? computeUnitPriceDomain(chartData) : undefined

  return createPortal(
    <div
      style={{ top, left, width: 600 }}
      className="fixed z-[9999] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-white text-sm font-semibold">{target.name}</p>
        <p className="text-gray-500 text-xs font-mono">{target.isin}</p>
      </div>

      {!history && <p className="text-gray-400 text-xs py-4 text-center">Loading…</p>}

      {chartData && chartData.length > 0 && (
        <>
          {/* Chart 1: position value */}
          <p className="text-gray-400 text-xs mb-1">Position value</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEMANTIC_COLORS.portfolioValue} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={SEMANTIC_COLORS.portfolioValue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt.format(v)} width={64} />
              <Tooltip content={<TooltipPortfolio />} />
              <Legend wrapperStyle={{ fontSize: 11, color: CHART_THEME.tick }} />
              <Area type="monotone" dataKey="Cost basis" stroke={SEMANTIC_COLORS.costBasis} strokeWidth={1.5} fill="none" strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey="Value" stroke={SEMANTIC_COLORS.portfolioValue} strokeWidth={2} fill="url(#gVal)"
                dot={<BuySellDot />} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* legend markers */}
          <div className="flex gap-4 text-xs text-gray-500 mt-1 mb-3 ml-2">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.transactionBuy }} />Buy</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.transactionSell }} />Sell</span>
          </div>

          {/* Chart 2: unit price — only when real market data is available */}
          {showUnitPrice && (
            <>
              <p className="text-gray-400 text-xs mb-1">Unit price</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="date" tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtDec.format(v)} width={64} domain={unitPriceDomain} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip content={(props: any) => <TooltipUnit {...props} series={chartData} />} />
                  <Line type="monotone" dataKey="Unit price" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2}
                    dot={<BuySellDotUnit />} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>,
    document.body
  )
}
