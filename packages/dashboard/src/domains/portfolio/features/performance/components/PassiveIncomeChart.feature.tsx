import { BarChart, Legend, ResponsiveContainer } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PassiveIncomeTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function PassiveIncomeChart({ data }: { data: PassiveIncomePoint[] }) {
  const formatMoney = useFormatMoney()
  return (
    <div className="flex-1">
      <Surface variant="chart">
        <Layout spaceAfter="default">
          <Text as="h2" variant="label" tone="muted">
            <Inline as="span" align="center">
              {i18n.t('ui.passiveincomechart.passiveIncomePerYear')}
              <ScopedInfoTooltip
                text={i18n.t(
                  'ui.passiveincomechart.netDividendsAndInterestGroupedByCalendarYear',
                )}
                scope={{ account: 'filterable', period: 'range' }}
              />
            </Inline>
          </Text>
        </Layout>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <ChartGrid />
            <ChartXAxis dataKey="year" />
            <ChartYAxis
              tickFormatter={(value) =>
                formatMoney(value, { style: 'compact' })
              }
              width={52}
            />
            <ChartTooltip highlight="bar">
              <PassiveIncomeTooltip />
            </ChartTooltip>
            <Legend formatter={PassiveIncomeLegendLabel} />
            <SeriesBar
              dataKey="dividends"
              stackId="a"
              tone={PORTFOLIO_CHART_TONES.passiveIncome}
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
              tone={PORTFOLIO_CHART_TONES.passiveIncomeSecondary}
              corners="top"
            />
          </BarChart>
        </ResponsiveContainer>
      </Surface>
    </div>
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
