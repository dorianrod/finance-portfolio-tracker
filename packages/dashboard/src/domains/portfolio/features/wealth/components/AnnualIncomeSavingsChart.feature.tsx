import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import { IncomeSavingsTooltip } from './IncomeSavingsTooltip.view'

export function AnnualIncomeSavingsChart({
  data,
}: {
  data: AnnualIncomeSavingsPoint[]
}) {
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-3 flex items-start gap-3">
        <div>
          <Text
            as="h2"
            variant="label"
            tone="secondary"
            className="flex items-center"
          >
            {i18n.t('ui.annualincomesavingschart.incomeVsNetContributions')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.annualincomesavingschart.annualDeclaredIncomeComparedWithDepositsMinusWithdrawalsAcross',
              )}
              scope={{ account: 'global', period: 'year-range' }}
            />
          </Text>
          <Text as="p" variant="caption" tone="subtle" className="mt-1">
            {i18n.t('ui.annualincomesavingschart.annualAllAccounts')}
          </Text>
        </div>
      </div>
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
            tickFormatter={(value) => `${value}%`}

            width={48}
          />
          <Tooltip content={<IncomeSavingsTooltip />} />
          <SeriesBar
            yAxisId="amount"
            dataKey="netSalary"
            stackId="income"
            tone="costBasis"
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
            tone="passiveIncome"
            corners="top"
          >
            <SeriesBar.Shape>
              <IncomeBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesBar
            yAxisId="amount"
            dataKey="placedSavings"
            tone="netContributions"
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
            tone="returnRate"
            weight="emphasized"
            markers="normal"
            hover="large"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Surface
        variant="captionFooter"
        tone="subtle"
        className="mt-3 flex flex-wrap gap-x-5 gap-y-2 pt-3"
      >
        <span className="flex items-center gap-2">
          <SeriesSwatch
            tone={'costBasis'}
            as="i"
            shape="bar"
            className="h-2.5 w-3"
          />
          {i18n.t('ui.annualincomesavingschart.netSalary.970d84')}
        </span>
        <span className="flex items-center gap-2">
          <SeriesSwatch
            tone={'passiveIncome'}
            as="i"
            shape="bar"
            className="h-2.5 w-3"
          />
          {i18n.t('ui.annualincomesavingschart.otherIncome.9eb09b')}
        </span>
        <span className="flex items-center gap-2">
          <SeriesSwatch
            tone={'netContributions'}
            as="i"
            shape="bar"
            className="h-2.5 w-3"
          />
          {i18n.t('ui.annualincomesavingschart.netContributions.643e29')}
        </span>
        <span className="flex items-center gap-2">
          <SeriesSwatch tone={'returnRate'} as="i" className="h-0.5 w-4" />
          {i18n.t('ui.annualincomesavingschart.placementRate.5df16e')}
        </span>
      </Surface>
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
