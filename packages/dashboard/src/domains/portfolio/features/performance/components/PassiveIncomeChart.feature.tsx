import { BarChart, Legend, ResponsiveContainer } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PassiveIncomeTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function PassiveIncomeChart({ data }: { data: PassiveIncomePoint[] }) {
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="chart" className="flex-1 p-4">
      <Text
        as="h2"
        variant="label"
        tone="muted"
        className="mb-3 flex items-center"
      >
        {i18n.t('ui.passiveincomechart.passiveIncomePerYear')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.passiveincomechart.netDividendsAndInterestGroupedByCalendarYear',
          )}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </Text>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <ChartGrid />
          <ChartXAxis dataKey="year" />
          <ChartYAxis
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}

            width={52}
          />
          <ChartTooltip highlight="bar">
            <PassiveIncomeTooltip />
          </ChartTooltip>
          <Legend formatter={PassiveIncomeLegendLabel} />
          <SeriesBar
            dataKey="dividends"
            stackId="a"
            tone="passiveIncome"
            corners="flat"
          >
            <ChartLabels
              dataKey="dividends"
              position="inside"
              formatter={(value: unknown) =>
                formatMoney(value as number, { style: 'compact' })
              }
            />
          </SeriesBar>
          <SeriesBar
            dataKey="interest"
            stackId="a"
            tone="passiveIncomeSecondary"
            corners="top"
          />
        </BarChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function PassiveIncomeLegendLabel(value: string) {
  return (
    <ChartText tone={'tick'} variant="caption">
      {value === 'dividends'
        ? i18n.t('ui.passiveincomechart.dividends')
        : i18n.t('ui.passiveincomechart.interest')}
    </ChartText>
  )
}
