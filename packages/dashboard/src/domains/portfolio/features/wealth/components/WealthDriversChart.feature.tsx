import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { WealthDriverPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DriversTooltip } from './WealthDriversTooltip.view'

export function WealthDriversChart({ data }: { data: WealthDriverPoint[] }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-content-secondary">
          {i18n.t('ui.wealthdriverschart.cumulativeWealthDrivers')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </h2>
        <p className="mt-0.5 text-xs text-content-subtle">
          {i18n.t('ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange')}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="driversSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SEMANTIC_COLORS.netContributions} stopOpacity={0.35} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.netContributions} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="driversPerformance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SEMANTIC_COLORS.performance} stopOpacity={0.3} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.performance} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value, { style: 'shortMonthShortYear' })}
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<DriversTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulative_savings"
            stroke={SEMANTIC_COLORS.netContributions}
            fill="url(#driversSavings)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="cumulative_performance"
            stroke={SEMANTIC_COLORS.performance}
            fill="url(#driversPerformance)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="cumulative_change"
            stroke={SEMANTIC_COLORS.totalChange}
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-subtle">
        <span>
          <i
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: SEMANTIC_COLORS.netContributions }}
          />
          {i18n.t('ui.wealthdriverschart.netContributions')}
        </span>
        <span>
          <i
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: SEMANTIC_COLORS.performance }}
          />
          {i18n.t('ui.wealthdriverschart.marketPerformance')}
        </span>
        <span>
          <i
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: SEMANTIC_COLORS.totalChange }}
          />
          {i18n.t('ui.wealthdriverschart.totalChange')}
        </span>
      </div>
    </div>
  )
}
