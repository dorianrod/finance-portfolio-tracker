import type { ReactNode } from 'react'
import { LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import { buildTriChartData } from '@/domains/portfolio/features/performance/components/TriChart/helpers/presenters/buildTriChartData'
import { TriTooltip } from '@/domains/portfolio/features/performance/components/TriChart/TriTooltip.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

// Fixed-window annualised IRRs, separate from the since-tracking KPI. Solid
// series start once their full trailing window is available; dotted leading
// segments extend their first values back to the beginning of the history.
export function TriChart({
  history,
  children,
}: {
  history: PortfolioHistoryPoint[]
  children: ReactNode
}) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  const chartData = buildTriChartData(history)
  if (chartData.length === 0) return null

  return (
    <Surface variant="chart" layout="subgrid">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.trichart.irrOverTimeTrailingAnnualised')}
            {children}
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
            tone={PORTFOLIO_CHART_TONES.totalChange}
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
            tone={PORTFOLIO_CHART_TONES.totalChange}
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
          />
          <SeriesLine
            type="linear"
            dataKey="tri_rolling_3y_backfill"
            connectNulls
            tone={PORTFOLIO_CHART_TONES.returnRate}
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
            tone={PORTFOLIO_CHART_TONES.returnRate}
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
          />
        </LineChart>
      </ResponsiveContainer>
      <Layout spaceBefore="default">
        <Text as="div" variant="caption" tone="subtle">
          <Inline as="div" flow="wrap" gap="relaxed">
            <Inline as="span" gap="compact">
              <Layout
                as="span"
                flow="inline"
                sizing="fixed"
                height="divider"
                width="icon"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.totalChange}
                  as="i"
                  shape="centeredLine"
                />
              </Layout>
              {i18n.t('ui.trichart.trailing1YearIrr')}
            </Inline>
            <Inline as="span" gap="compact">
              <Layout
                as="span"
                flow="inline"
                sizing="fixed"
                height="divider"
                width="icon"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.returnRate}
                  as="i"
                  shape="centeredLine"
                />
              </Layout>
              {i18n.t('ui.trichart.trailing3YearIrr')}
            </Inline>
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}
