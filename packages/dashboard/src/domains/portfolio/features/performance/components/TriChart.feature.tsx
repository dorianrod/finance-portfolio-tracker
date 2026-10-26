import { LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { TriTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import { buildTriChartData } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

// Fixed-window annualised IRRs, separate from the since-tracking KPI. Solid
// series start once their full trailing window is available; dotted leading
// segments extend their first values back to the beginning of the history.
export function TriChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  const chartData = buildTriChartData(history)
  if (chartData.length === 0) return null

  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.trichart.irrOverTimeTrailingAnnualised')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.trichart.annualizedMoneyWeightedReturnCalculatedOverRollingFixedWindows',
              )}
              scope={{ account: 'filterable', period: 'range' }}
            />
          </Inline>
        </Text>
      </Layout>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <ChartGrid />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
            interval="preserveStartEnd"
          />
          <ChartYAxis
            tickFormatter={(value: number) =>
              formatPercentage(value, { decimals: 0 })
            }
            width={52}
          />
          <ChartReference y={0} kind="zeroDashed" />
          <Tooltip content={<TriTooltip />} />
          <SeriesLine
            type="linear"
            dataKey="tri_rolling_1y_backfill"
            connectNulls
            tone="totalChange"
            weight="regular"
            pattern="projection"
            markers="hidden"
            hover="hidden"
            motion="none"
          />
          <SeriesLine
            type="monotone"
            dataKey="tri_rolling_1y"
            connectNulls
            tone="totalChange"
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
          />
          <SeriesLine
            type="linear"
            dataKey="tri_rolling_3y_backfill"
            connectNulls
            tone="returnRate"
            weight="regular"
            pattern="projection"
            markers="hidden"
            hover="hidden"
            motion="none"
          />
          <SeriesLine
            type="monotone"
            dataKey="tri_rolling_3y"
            connectNulls
            tone="returnRate"
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
          />
        </LineChart>
      </ResponsiveContainer>
      <Layout spaceBefore="default">
        <Text as="div" variant="caption" tone="subtle">
          <Inline as="div" flow="wrap" gap="compact">
            <span>
              <Layout as="span" flow="inline" height="divider" width="icon">
                <SeriesSwatch
                  tone={'totalChange'}
                  as="i"
                  shape="centeredLine"
                />
              </Layout>
              {i18n.t('ui.trichart.trailing1YearIrr')}
            </span>
            <span>
              <Layout as="span" flow="inline" height="divider" width="icon">
                <SeriesSwatch tone={'returnRate'} as="i" shape="centeredLine" />
              </Layout>
              {i18n.t('ui.trichart.trailing3YearIrr')}
            </span>
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}
