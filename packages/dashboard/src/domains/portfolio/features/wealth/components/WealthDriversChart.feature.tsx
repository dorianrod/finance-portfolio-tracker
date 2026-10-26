import { ComposedChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { WealthDriverPoint } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations/wealthCalculations.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

import { DriversTooltip } from './WealthDriversTooltip.view'

export function WealthDriversChart({ data }: { data: WealthDriverPoint[] }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.wealthdriverschart.cumulativeWealthDrivers')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
              )}
              scope={{ account: 'filterable', period: 'range' }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t(
              'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
            )}
          </Text>
        </Layout>
      </Layout>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <SeriesGradient
              id="driversSavings"
              profile="light"
              tone={PORTFOLIO_CHART_TONES.netContributions}
            />
            <SeriesGradient
              id="driversPerformance"
              profile="subtle"
              tone={PORTFOLIO_CHART_TONES.performance}
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
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            width={52}
          />
          <Tooltip content={<DriversTooltip />} />
          <SeriesArea
            type="monotone"
            dataKey="cumulative_savings"
            tone={PORTFOLIO_CHART_TONES.netContributions}
            gradientId="driversSavings"
            weight="regular"
          />
          <SeriesArea
            type="monotone"
            dataKey="cumulative_performance"
            tone={PORTFOLIO_CHART_TONES.performance}
            gradientId="driversPerformance"
            weight="regular"
          />
          <SeriesLine
            type="monotone"
            dataKey="cumulative_change"
            tone={PORTFOLIO_CHART_TONES.totalChange}
            weight="emphasized"
            markers="hidden"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Layout spaceBefore="default">
        <Text as="div" variant="caption" tone="subtle">
          <Inline as="div" flow="wrap" gap="compact">
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.netContributions}
                  as="i"
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.wealthdriverschart.netContributions')}
            </span>
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.performance}
                  as="i"
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.wealthdriverschart.marketPerformance')}
            </span>
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.totalChange}
                  as="i"
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.wealthdriverschart.totalChange')}
            </span>
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}
