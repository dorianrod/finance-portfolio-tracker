import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

import { IncomeSavingsTooltip } from './IncomeSavingsTooltip.view'

export function AnnualIncomeSavingsChart({
  data,
}: {
  data: AnnualIncomeSavingsPoint[]
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="chart">
      <Inline as="div" spaceAfter="default" align="start" gap="default">
        <div>
          <Text as="h2" variant="label" tone="secondary">
            <Inline as="span" align="center">
              {i18n.t('ui.annualincomesavingschart.incomeVsNetContributions')}
              <ScopedInfoTooltip
                text={i18n.t(
                  'ui.annualincomesavingschart.annualDeclaredIncomeComparedWithDepositsMinusWithdrawalsAcross',
                )}
                scope={{ account: 'global', period: 'year-range' }}
              />
            </Inline>
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {i18n.t('ui.annualincomesavingschart.annualAllAccounts')}
            </Text>
          </Layout>
        </div>
      </Inline>
      <ResponsiveContainer width="100%" height={285}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 48, left: 0, bottom: 0 }}
          barGap={3}
        >
          <ChartGrid />
          <ChartXAxis dataKey="year" />
          <ChartYAxis
            yAxisId="amount"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            width={52}
          />
          <ChartYAxis
            yAxisId="rate"
            orientation="right"
            tickFormatter={(value) =>
              formatPercentage(Number(value), { decimals: 'auto' })
            }
            width={48}
          />
          <Tooltip content={<IncomeSavingsTooltip />} />
          <SeriesBar
            yAxisId="amount"
            dataKey="netSalary"
            stackId="income"
            tone={PORTFOLIO_CHART_TONES.costBasis}
            corners="bottom"
          >
            <SeriesBar.Shape>
              <IncomeBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesBar
            yAxisId="amount"
            dataKey="otherIncome"
            stackId="income"
            tone={PORTFOLIO_CHART_TONES.passiveIncome}
            corners="top"
          >
            <SeriesBar.Shape>
              <IncomeBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesBar
            yAxisId="amount"
            dataKey="placedSavings"
            tone={PORTFOLIO_CHART_TONES.netContributions}
            corners="top"
          >
            <SeriesBar.Shape>
              <SavingsBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesLine
            yAxisId="rate"
            type="monotone"
            dataKey="placementRate"
            connectNulls={false}
            tone={PORTFOLIO_CHART_TONES.returnRate}
            weight="emphasized"
            markers="normal"
            hover="large"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Layout spaceBefore="default">
        <Surface variant="captionFooter" tone="subtle">
          <Inline as="div" flow="wrap" gap="default" inset="default">
            <Inline as="span" align="center" gap="default">
              <Layout as="span" flow="inline" height="indicator" width="icon">
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.costBasis}
                  as="i"
                  shape="bar"
                />
              </Layout>
              {i18n.t('ui.annualincomesavingschart.netSalary.970d84')}
            </Inline>
            <Inline as="span" align="center" gap="default">
              <Layout as="span" flow="inline" height="indicator" width="icon">
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.passiveIncome}
                  as="i"
                  shape="bar"
                />
              </Layout>
              {i18n.t('ui.annualincomesavingschart.otherIncome.9eb09b')}
            </Inline>
            <Inline as="span" align="center" gap="default">
              <Layout as="span" flow="inline" height="indicator" width="icon">
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.netContributions}
                  as="i"
                  shape="bar"
                />
              </Layout>
              {i18n.t('ui.annualincomesavingschart.netContributions.643e29')}
            </Inline>
            <Inline as="span" align="center" gap="default">
              <Layout as="span" flow="inline" height="divider" width="icon">
                <SeriesSwatch tone={PORTFOLIO_CHART_TONES.returnRate} as="i" />
              </Layout>
              {i18n.t('ui.annualincomesavingschart.placementRate.5df16e')}
            </Inline>
          </Inline>
        </Surface>
      </Layout>
    </Surface>
  )
}

function IncomeBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, AnnualIncomeSavingsPoint>>,
) {
  const point = shapeProps.payload
  if (!point) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      prominence={point.incomeStatus === 'forecast' ? 'muted' : 'full'}
    />
  )
}

function SavingsBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, AnnualIncomeSavingsPoint>>,
) {
  const point = shapeProps.payload
  if (!point) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      prominence={point.savingsStatus === 'complete' ? 'strong' : 'subtle'}
    />
  )
}
