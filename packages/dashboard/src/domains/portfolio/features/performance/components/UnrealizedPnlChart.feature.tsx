import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import {
  type UnrealizedPnlPoint,
  UnrealizedPnlTooltip,
} from './UnrealizedPnlTooltip.view'

export function UnrealizedPnlChart({
  history,
}: {
  history: PortfolioHistoryPoint[]
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const data: UnrealizedPnlPoint[] = history.map((point, index) => ({
    ...point,
    unrealized_gain_pct:
      point.total_cost_basis > 0
        ? (point.unrealized_gain / point.total_cost_basis) * 100
        : null,
    snapshot_change:
      index > 0
        ? point.unrealized_gain - history[index - 1].unrealized_gain
        : null,
  }))

  if (data.length === 0) return null

  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-3">
        <Text
          as="h2"
          variant="label"
          tone="secondary"
          className="flex items-center"
        >
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandlOverTime')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </Text>
        <Text as="p" variant="caption" tone="subtle" className="mt-0.5">
          {i18n.t(
            'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
          )}
        </Text>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <ChartGrid vertical={false} />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }

            interval="preserveStartEnd"
          />
          <ChartYAxis
            yAxisId="amount"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}

            width={52}
          />
          <ChartYAxis
            yAxisId="pct"
            orientation="right"
            tickFormatter={(value: number) =>
              formatPercentage(value, { decimals: 0 })
            }

            width={42}
          />
          <ChartReference yAxisId="amount" y={0} kind="zero" />
          <ChartTooltip highlight="bar">
            <UnrealizedPnlTooltip />
          </ChartTooltip>
          <SeriesBar
            yAxisId="amount"
            dataKey="unrealized_gain"
            maxBarSize={24}
            corners="rounded"
            motion="none"
          >
            <SeriesBar.Shape>
              <UnrealizedPnlBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesLine
            yAxisId="pct"
            type="monotone"
            dataKey="unrealized_gain_pct"
            connectNulls
            tone="returnRate"
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
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
            tone={'performancePositive'}
            as="i"
            shape="dot"
            className="mr-1.5 inline-block h-2 w-2"
          />
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedGain')}
        </span>
        <span>
          <SeriesSwatch
            tone={'performanceNegative'}
            as="i"
            shape="dot"
            className="mr-1.5 inline-block h-2 w-2"
          />
          {i18n.t('ui.unrealizedpnlchart.grossUnrealizedLoss')}
        </span>
        <span>
          <SeriesSwatch
            tone={'returnRate'}
            as="i"
            shape="centeredLine"
            className="mr-1.5 inline-block h-0.5 w-3"
          />
          {i18n.t('ui.unrealizedpnlchart.pandlCapitalPlaced')}
        </span>
      </Text>
    </Surface>
  )
}

function UnrealizedPnlBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, UnrealizedPnlPoint>>,
) {
  const point = shapeProps.payload
  if (!point) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={
        point.unrealized_gain >= 0
          ? 'performancePositive'
          : 'performanceNegative'
      }
    />
  )
}
