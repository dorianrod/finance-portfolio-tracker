import type { ReactNode } from 'react'
import { BarChart, Legend, ResponsiveContainer } from 'recharts'

import { PassiveIncomeTooltip } from '@/domains/portfolio/features/performance/components/performanceChartTooltips/PassiveIncomeTooltip.view'
import type { PassiveIncomePoint } from '@/domains/portfolio/features/performance/types/passiveIncomePoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLabels } from '@/shared/ui/chartLabels/ChartLabels.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function PassiveIncomeChart({
  data,
  children,
}: {
  data: PassiveIncomePoint[]
  children: ReactNode
}) {
  const formatMoney = useFormatMoney()
  return (
    <div className="flex-1">
      <Surface variant="chart">
        <Layout spaceAfter="default">
          <Text as="h2" variant="label" tone="muted">
            <Inline as="span" align="center">
              {i18n.t('ui.passiveincomechart.passiveIncomePerYear')}
              {children}
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
                  formatMoney(typeof value === 'number' ? value : undefined, {
                    style: 'compact',
                  })
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
