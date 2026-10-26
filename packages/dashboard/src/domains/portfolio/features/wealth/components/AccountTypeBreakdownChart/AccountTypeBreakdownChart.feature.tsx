import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { resolveAccountTypeLabelPositions } from '@/domains/portfolio/features/wealth/helpers/calculators/resolveAccountTypeLabelPositions'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { AccountTypeTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { AccountTypePoint } from '@/domains/portfolio/shared/types/accountTypePoint.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel, ChartLeaderLine } from '@/shared/ui/ChartLabel.view'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { getAccountTypeLeaderLine } from './helpers/presenters/getAccountTypeLeaderLine'
import { getAccountTypeSplitRadius } from './helpers/presenters/getAccountTypeSplitRadius'

function AccountTypeLabel({
  data,
  ...props
}: Partial<PieLabelRenderProps> & { data: AccountTypePoint[] }) {
  const formatPercentage = useFormatPercentage()
  const { cx, cy, midAngle, outerRadius, payload, percent, index } = props
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof index !== 'number'
  )
    return null
  const point = payload as AccountTypePoint
  const position = resolveAccountTypeLabelPositions(data, cx, cy, outerRadius)[
    index
  ]
  if (!position) return null

  const leaderLine = getAccountTypeLeaderLine(
    cx,
    cy,
    midAngle,
    outerRadius,
    position,
  )

  return (
    <g>
      <ChartLeaderLine points={leaderLine} />
      <ChartLabel
        x={position.x}
        y={position.y}
        align={position.isRight ? 'start' : 'end'}
      >
        {point.account_type} ·{' '}
        {formatPercentage((percent ?? 0) * 100, { decimals: 0 })}
      </ChartLabel>
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
  const point = payload as AccountTypePoint
  const radius = outerRadius ?? 0
  const splitRadius = getAccountTypeSplitRadius(point, radius)
  const sectorBase = {
    cx,
    cy,
    startAngle,
    endAngle,
  }

  if (point.unrealized_gain < 0) {
    return (
      <g>
        <ChartSector
          {...sectorBase}
          innerRadius={0}
          outerRadius={radius}
          category={point.account_type}
          variant="splitBase"
        />
        <ChartSector
          {...sectorBase}
          innerRadius={splitRadius}
          outerRadius={radius}
          tone="performanceNegative"
          variant="splitOverlay"
        />
      </g>
    )
  }

  return (
    <g>
      {splitRadius > 0 && (
        <ChartSector
          {...sectorBase}
          innerRadius={0}
          outerRadius={splitRadius}
          category={point.account_type}
          variant="splitBase"
        />
      )}
      {point.unrealized_gain > 0 && (
        <ChartSector
          {...sectorBase}
          innerRadius={splitRadius}
          outerRadius={radius}
          tone="performancePositive"
          variant="splitOverlay"
        />
      )}
    </g>
  )
}

export function AccountTypeBreakdownChart({
  data,
}: {
  data: AccountTypePoint[]
}) {
  const donutData: AccountTypePoint[] = data.map((point) => ({
    ...point,
    total_cost_basis: Math.max(0, point.total_cost_basis),
  }))
  const pieData = donutData.filter((point) => point.total_value > 0)
  const totalValue = data.reduce((sum, point) => sum + point.total_value, 0)

  return (
    <Surface variant="chart" className="flex-1 p-4">
      <Text as="h2" variant="label" tone="muted" className="flex items-center">
        {i18n.t('ui.accounttypebreakdownchart.breakdownByAccountType')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeTheRadialSplit',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </Text>
      <Text as="p" variant="caption" tone="subtle" className="mt-1">
        {i18n.t(
          'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeRadialSplitCost',
        )}
      </Text>

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
            label={<AccountTypeLabel data={pieData} />}
            labelLine={false}
          />
          <Tooltip
            content={<AccountTypeTooltip portfolioTotal={totalValue} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </Surface>
  )
}
