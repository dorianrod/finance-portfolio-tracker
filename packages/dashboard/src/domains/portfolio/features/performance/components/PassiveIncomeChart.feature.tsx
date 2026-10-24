import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PassiveIncomeTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

export function PassiveIncomeChart({ data }: { data: PassiveIncomePoint[] }) {
  const formatMoney = useFormatMoney()
  return (
    <div className="flex-1 bg-surface rounded-xl p-4">
      <h2 className="mb-3 flex items-center text-sm font-medium text-content-muted">
        {i18n.t('ui.passiveincomechart.passiveIncomePerYear')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.passiveincomechart.netDividendsAndInterestGroupedByCalendarYear',
          )}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="year"
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            content={<PassiveIncomeTooltip />}
            cursor={{ fill: CHART_THEME.cursor }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
                {value === 'dividends'
                  ? i18n.t('ui.passiveincomechart.dividends')
                  : i18n.t('ui.passiveincomechart.interest')}
              </span>
            )}
          />
          <Bar
            dataKey="dividends"
            stackId="a"
            fill={SEMANTIC_COLORS.passiveIncome}
            radius={[0, 0, 0, 0]}
          >
            <LabelList
              dataKey="dividends"
              position="inside"
              formatter={(value: unknown) =>
                formatMoney(value as number, { style: 'compact' })
              }
              style={{ fill: 'var(--tooltip-label)', fontSize: 10 }}
            />
          </Bar>
          <Bar
            dataKey="interest"
            stackId="a"
            fill={SEMANTIC_COLORS.passiveIncomeSecondary}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
