import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useIncomePlacementChart } from '@/domains/portfolio/features/wealth/services/useIncomePlacementChart'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

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
    <div className="bg-surface rounded-xl p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-content-secondary">
          {i18n.t(
            'ui.incomeplacementrelationshipchart.incomeLevelVsPlacementRate',
          )}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.incomeplacementrelationshipchart.relationshipBetweenAnnualDeclaredIncomeAndTheSharePlaced',
            )}
            scope={{ account: 'global', period: 'year-range' }}
          />
        </h2>
        <p className="mt-1 text-xs text-content-subtle">
          {i18n.t(
            'ui.incomeplacementrelationshipchart.comparableActualYearsOnlyAllAccountsLatest3Years',
          )}
        </p>
      </div>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="text-content-subtle">
          {i18n.t('ui.incomeplacementrelationshipchart.correlation')}{' '}
          <strong className="font-semibold text-content-secondary">
            {analysis.correlation == null
              ? '—'
              : formatNumber(analysis.correlation, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                  signDisplay: 'always',
                })}
          </strong>
        </span>
        <span className="text-content-subtle">
          {i18n.t('ui.incomeplacementrelationshipchart.trendPer10kIncome')}{' '}
          <strong className="font-semibold text-content-secondary">
            {analysis.slopePerTenThousand == null
              ? '—'
              : formatPercentage(analysis.slopePerTenThousand, {
                  signed: true,
                  unit: ' pp',
                })}
          </strong>
        </span>
      </div>
      <ResponsiveContainer
        width="100%"
        height={285}
        onResize={(width) => setChartWidth(width)}
      >
        <ScatterChart margin={{ top: 18, right: 24, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            type="number"
            dataKey="totalIncome"
            name={i18n.t('ui.incomeplacementrelationshipchart.netIncome')}
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey="placementRate"
            name={i18n.t(
              'ui.incomeplacementrelationshipchart.placementRate.5df16e',
            )}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<RelationshipTooltip />}
          />
          {trendLine && (
            <ReferenceLine
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
              stroke={SEMANTIC_COLORS.neutralSeries}
              strokeDasharray="5 4"
              strokeWidth={2}
            />
          )}
          <Scatter data={analysis.points} fill={SEMANTIC_COLORS.returnRate}>
            {analysis.points.map((point) => (
              <Cell
                key={point.year}
                fill={
                  recentYears.has(point.year)
                    ? SEMANTIC_COLORS.returnRate
                    : SEMANTIC_COLORS.neutralSeries
                }
                fillOpacity={
                  recentYears.has(point.year)
                    ? 1
                    : 0.3 +
                      ((point.year - oldestYear) /
                        Math.max(1, newestYear - oldestYear)) *
                        0.35
                }
              />
            ))}
            <LabelList
              dataKey="year"
              content={(props) => (
                <YearLabel
                  {...props}
                  placements={labelPlacements}
                  chartPoints={analysis.points}
                  recentYears={recentYears}
                  oldestYear={oldestYear}
                  newestYear={newestYear}
                />
              )}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-content-subtle">
        {i18n.t(
          'ui.incomeplacementrelationshipchart.theUnplacedAmountIsIncomeMinusObservedNetContributions',
        )}
      </p>
    </div>
  )
}
