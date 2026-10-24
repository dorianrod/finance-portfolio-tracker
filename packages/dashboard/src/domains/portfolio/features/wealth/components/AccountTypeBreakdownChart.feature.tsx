import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts'
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'

import {
  type AccountTypeDonutPoint,
  resolveAccountTypeLabelPositions,
} from '@/domains/portfolio/features/wealth/helpers/calculators/resolveAccountTypeLabelPositions'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { AccountTypeTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { catColor } from '@/shared/theme/chartColors'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

function AccountTypeLabel({
  data,
  ...props
}: PieLabelRenderProps & { data: AccountTypeDonutPoint[] }) {
  const formatPercentage = useFormatPercentage()
  const { cx, cy, midAngle, outerRadius, payload, percent, index } = props
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number'
  )
    return null
  const point = payload as AccountTypeDonutPoint
  const position = resolveAccountTypeLabelPositions(data, cx, cy, outerRadius)[
    index
  ]
  if (!position) return null

  const radians = (-midAngle * Math.PI) / 180
  const edgeRadius = outerRadius + 2
  const elbowRadius = outerRadius + 10
  const edgeX = cx + edgeRadius * Math.cos(radians)
  const edgeY = cy + edgeRadius * Math.sin(radians)
  const elbowX = cx + elbowRadius * Math.cos(radians)
  const elbowY = cy + elbowRadius * Math.sin(radians)
  const lineEndX = position.x + (position.isRight ? -4 : 4)

  return (
    <g>
      <polyline
        points={`${edgeX},${edgeY} ${elbowX},${elbowY} ${lineEndX},${position.y}`}
        fill="none"
        stroke="var(--chart-zero)"
        strokeWidth={0.75}
      />
      <text
        x={position.x}
        y={position.y}
        fill="var(--chart-label)"
        fontSize={11}
        textAnchor={position.isRight ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {point.account_type} ·{' '}
        {formatPercentage((percent ?? 0) * 100, { decimals: 0 })}
      </text>
    </g>
  )
}

function AccountTypeSector({
  cx,
  cy,
  startAngle,
  endAngle,
  outerRadius,
  payload,
}: PieSectorShapeProps) {
  const point = payload as AccountTypeDonutPoint
  const radius = outerRadius ?? 0
  const accountColor = catColor(point.account_type)
  const sectorBase = {
    cx,
    cy,
    startAngle,
    endAngle,
    stroke: 'var(--ds-surface)',
    strokeWidth: 0.5,
    strokeOpacity: 0.7,
  }

  if (point.unrealized_gain < 0) {
    const lossRatio =
      point.total_cost_basis > 0
        ? Math.min(
            Math.abs(point.unrealized_gain) / point.total_cost_basis,
            0.95,
          )
        : 1
    const lossInnerRadius = radius * Math.sqrt(1 - lossRatio)
    return (
      <g>
        <Sector
          {...sectorBase}
          innerRadius={0}
          outerRadius={radius}
          fill={accountColor}
          fillOpacity={0.48}
        />
        <Sector
          {...sectorBase}
          innerRadius={lossInnerRadius}
          outerRadius={radius}
          fill={SEMANTIC_COLORS.performancePositive}
          fillOpacity={0.68}
        />
      </g>
    )
  }

  const positiveTotal = point.total_cost_basis + point.unrealized_gain
  const costRatio =
    positiveTotal > 0 ? Math.min(point.total_cost_basis / positiveTotal, 1) : 0
  const splitRadius = radius * Math.sqrt(costRatio)
  return (
    <g>
      {splitRadius > 0 && (
        <Sector
          {...sectorBase}
          innerRadius={0}
          outerRadius={splitRadius}
          fill={accountColor}
          fillOpacity={0.48}
        />
      )}
      {point.unrealized_gain > 0 && (
        <Sector
          {...sectorBase}
          innerRadius={splitRadius}
          outerRadius={radius}
          fill={SEMANTIC_COLORS.performancePositive}
          fillOpacity={0.68}
        />
      )}
    </g>
  )
}

export function AccountTypeBreakdownChart({
  data,
}: {
  data: AccountTypeDonutPoint[]
}) {
  const donutData: AccountTypeDonutPoint[] = data.map((point) => ({
    ...point,
    total_cost_basis: Math.max(0, point.total_cost_basis),
  }))
  const pieData = donutData.filter((point) => point.total_value > 0)
  const totalValue = data.reduce((sum, point) => sum + point.total_value, 0)

  return (
    <div className="flex-1 bg-surface rounded-xl p-4">
      <h2 className="flex items-center text-sm font-medium text-content-muted">
        {i18n.t('ui.accounttypebreakdownchart.breakdownByAccountType')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeTheRadialSplit',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </h2>
      <p className="mt-1 text-xs text-content-subtle">
        {i18n.t(
          'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeRadialSplitCost',
        )}
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="total_value"
            nameKey="account_type"
            innerRadius={0}
            outerRadius="63%"
            paddingAngle={0.25}
            startAngle={90}
            endAngle={-270}
            shape={AccountTypeSector}
            // eslint-disable-next-line local/no-prop-drilling -- Recharts label payload adaptation is visual logic owned by this chart feature.
            label={(props) => <AccountTypeLabel {...props} data={pieData} />}
            labelLine={false}
          />
          <Tooltip
            content={<AccountTypeTooltip portfolioTotal={totalValue} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
