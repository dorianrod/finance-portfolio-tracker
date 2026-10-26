import {
  LabelList,
  ResponsiveContainer,
  ScatterChart,
  type ScatterShapeProps,
} from 'recharts'

import { RelationshipTooltip } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/incomePlacementTooltip/RelationshipTooltip.view'
import { YearLabel } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/incomePlacementTooltip/YearLabel.view'
import { useIncomePlacementChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/services/useIncomePlacementChart'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { ChartSymbol } from '@/shared/ui/seriesScatter/ChartSymbol.view'
import { SeriesScatter } from '@/shared/ui/seriesScatter/SeriesScatter.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

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
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t(
              'ui.incomeplacementrelationshipchart.incomeLevelVsPlacementRate',
            )}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.incomeplacementrelationshipchart.relationshipBetweenAnnualDeclaredIncomeAndTheSharePlaced',
              )}
              scope={{ account: 'global', period: 'year-range' }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t(
              'ui.incomeplacementrelationshipchart.comparableActualYearsOnlyAllAccountsLatest3Years',
            )}
          </Text>
        </Layout>
      </Layout>
      <Layout spaceAfter="default">
        <Text as="div" variant="caption">
          <Inline as="div" flow="wrap" gap="compact">
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
          </Inline>
        </Text>
      </Layout>
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
          <SeriesScatter
            data={analysis.points}
            tone={PORTFOLIO_CHART_TONES.returnRate}
          >
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
      <Layout spaceBefore="default">
        <Text variant="noteFooter" as="p" tone="subtle">
          <Layout as="span" flow="block" inset="default">
            {i18n.t(
              'ui.incomeplacementrelationshipchart.theUnplacedAmountIsIncomeMinusObservedNetContributions',
            )}
          </Layout>
        </Text>
      </Layout>
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
      tone={
        isRecent
          ? PORTFOLIO_CHART_TONES.returnRate
          : PORTFOLIO_CHART_TONES.neutralSeries
      }
      age={{ year: point.year, recent: isRecent, oldestYear, newestYear }}
    />
  )
}
