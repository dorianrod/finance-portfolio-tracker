import { ComposedChart, ResponsiveContainer, Tooltip } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { WealthDriverPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import { DriversTooltip } from './WealthDriversTooltip.view'

export function WealthDriversChart({ data }: { data: WealthDriverPoint[] }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-3">
        <Text
          as="h2"
          variant="label"
          tone="secondary"
          className="flex items-center"
        >
          {i18n.t('ui.wealthdriverschart.cumulativeWealthDrivers')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </Text>
        <Text as="p" variant="caption" tone="subtle" className="mt-0.5">
          {i18n.t(
            'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
          )}
        </Text>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <SeriesGradient
              id="driversSavings"
              profile="light"
              tone="netContributions"
            />
            <SeriesGradient
              id="driversPerformance"
              profile="subtle"
              tone="performance"
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
            tone="netContributions"
            gradientId="driversSavings"
            weight="regular"
          />
          <SeriesArea
            type="monotone"
            dataKey="cumulative_performance"
            tone="performance"
            gradientId="driversPerformance"
            weight="regular"
          />
          <SeriesLine
            type="monotone"
            dataKey="cumulative_change"
            tone="totalChange"
            weight="emphasized"
            markers="hidden"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Text
        as="div"
        variant="caption"
        tone="subtle"
        className="mt-2 flex flex-wrap gap-x-5 gap-y-1"
      >
        <span>
          <SeriesSwatch
            tone={'netContributions'}
            as="i"
            shape="dot"
            className="mr-1.5 inline-block h-2 w-2"
          />
          {i18n.t('ui.wealthdriverschart.netContributions')}
        </span>
        <span>
          <SeriesSwatch
            tone={'performance'}
            as="i"
            shape="dot"
            className="mr-1.5 inline-block h-2 w-2"
          />
          {i18n.t('ui.wealthdriverschart.marketPerformance')}
        </span>
        <span>
          <SeriesSwatch
            tone={'totalChange'}
            as="i"
            shape="dot"
            className="mr-1.5 inline-block h-2 w-2"
          />
          {i18n.t('ui.wealthdriverschart.totalChange')}
        </span>
      </Text>
    </Surface>
  )
}
