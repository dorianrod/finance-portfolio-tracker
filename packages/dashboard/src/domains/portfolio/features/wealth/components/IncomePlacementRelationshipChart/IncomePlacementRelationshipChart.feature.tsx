import {
  LabelList,
  ResponsiveContainer,
  ScatterChart,
  type ScatterShapeProps,
} from 'recharts'

import { useIncomePlacementChart } from '@/domains/portfolio/features/wealth/services/useIncomePlacementChart'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { ChartSymbol, SeriesScatter } from '@/shared/ui/SeriesScatter.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { RelationshipTooltip, YearLabel } from './IncomePlacementTooltip.view'

export function IncomePlacementRelationshipChart({
  data,
}: {
  data: AnnualIncomeSavingsPoint[]
}) {
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const {
    analysis,
    labelPlacements,
    newestYear,
    oldestYear,
    recentYears,
    setChartWidth,
  } = useIncomePlacementChart(data)
  const [trendStart, trendEnd] = analysis.trendLine
  const trendLine =
    trendStart && trendEnd ? { end: trendEnd, start: trendStart } : null
  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-3">
        <Text
          as="h2"
          variant="label"
          tone="secondary"
          className="flex items-center"
        >
          {i18n.t(
            'ui.incomeplacementrelationshipchart.incomeLevelVsPlacementRate',
          )}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.incomeplacementrelationshipchart.relationshipBetweenAnnualDeclaredIncomeAndTheSharePlaced',
            )}
            scope={{ account: 'global', period: 'year-range' }}
          />
        </Text>
        <Text as="p" variant="caption" tone="subtle" className="mt-1">
          {i18n.t(
            'ui.incomeplacementrelationshipchart.comparableActualYearsOnlyAllAccountsLatest3Years',
          )}
        </Text>
      </div>
      <Text
        as="div"
        variant="caption"
        className="mb-2 flex flex-wrap gap-x-5 gap-y-1"
      >
        <Text tone="subtle">
          {i18n.t('ui.incomeplacementrelationshipchart.correlation')}{' '}
          <Text as="strong" variant="strong" tone="secondary">
            {formatNumber(analysis.correlation, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
              signDisplay: 'always',
            })}
          </Text>
        </Text>
        <Text tone="subtle">
          {i18n.t('ui.incomeplacementrelationshipchart.trendPer10kIncome')}{' '}
          <Text as="strong" variant="strong" tone="secondary">
            {formatPercentage(analysis.slopePerTenThousand, {
              signed: true,
              unit: ' pp',
            })}
          </Text>
        </Text>
      </Text>
      <ResponsiveContainer
        width="100%"
        height={285}
        onResize={(width) => setChartWidth(width)}
      >
        <ScatterChart margin={{ top: 18, right: 24, left: 4, bottom: 8 }}>
          <ChartGrid />
          <ChartXAxis
            type="number"
            dataKey="totalIncome"
            name={i18n.t('ui.incomeplacementrelationshipchart.netIncome')}
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
          />
          <ChartYAxis
            type="number"
            dataKey="placementRate"
            name={i18n.t(
              'ui.incomeplacementrelationshipchart.placementRate.5df16e',
            )}
            tickFormatter={(value) => `${value}%`}

            width={48}
          />
          <ChartTooltip highlight="dashed">
            <RelationshipTooltip />
          </ChartTooltip>
          {trendLine && (
            <ChartReference
              segment={[
                {
                  x: trendLine.start.totalIncome,
                  y: trendLine.start.placementRate,
                },
                {
                  x: trendLine.end.totalIncome,
                  y: trendLine.end.placementRate,
                },
              ]}
              kind="benchmark"
            />
          )}
          <SeriesScatter data={analysis.points} tone="returnRate">
            <SeriesScatter.Shape>
              <IncomePlacementPoint
                recentYears={recentYears}
                oldestYear={oldestYear}
                newestYear={newestYear}
              />
            </SeriesScatter.Shape>
            <LabelList
              dataKey="year"
              content={
                <YearLabel
                  placements={labelPlacements}
                  chartPoints={analysis.points}
                  recentYears={recentYears}
                  oldestYear={oldestYear}
                  newestYear={newestYear}
                />
              }
            />
          </SeriesScatter>
        </ScatterChart>
      </ResponsiveContainer>
      <Text variant="noteFooter" as="p" tone="subtle" className="mt-3 pt-3">
        {i18n.t(
          'ui.incomeplacementrelationshipchart.theUnplacedAmountIsIncomeMinusObservedNetContributions',
        )}
      </Text>
    </Surface>
  )
}

function IncomePlacementPoint({
  recentYears,
  oldestYear,
  newestYear,
  ...shapeProps
}: Partial<ChartShapeProps<ScatterShapeProps, AnnualIncomeSavingsPoint>> & {
  recentYears: Set<number>
  oldestYear: number
  newestYear: number
}) {
  const point = shapeProps.payload
  if (!point) return null
  const isRecent = recentYears.has(point.year)
  return (
    <ChartSymbol
      geometry={shapeProps}
      tone={isRecent ? 'returnRate' : 'neutralSeries'}
      age={{ year: point.year, recent: isRecent, oldestYear, newestYear }}
    />
  )
}
