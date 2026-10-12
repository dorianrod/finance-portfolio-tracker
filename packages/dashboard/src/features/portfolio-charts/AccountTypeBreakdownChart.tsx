import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts'
import { catColor } from '@/shared/format/colors'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { AccountTypeTooltip } from './portfolioCharts.tooltips'
import type { AccountTypePointWithLabel } from './portfolioCharts.logic'

type DonutPoint = AccountTypePointWithLabel

interface LabelPosition {
  x: number
  y: number
  isRight: boolean
}

function resolveLabelPositions(data: DonutPoint[], cx: number, cy: number, outerRadius: number): LabelPosition[] {
  const total = data.reduce((sum, point) => sum + point.total_value, 0)
  const labelRadius = outerRadius + 24
  let cursorAngle = 90
  const positions = data.map((point, index) => {
    const sweep = total > 0 ? point.total_value / total * 360 : 0
    const midAngle = cursorAngle - sweep / 2
    cursorAngle -= sweep
    const radians = -midAngle * Math.PI / 180
    const isRight = Math.cos(radians) >= 0
    return {
      index,
      isRight,
      desiredY: cy + labelRadius * Math.sin(radians),
      x: cx + (isRight ? labelRadius : -labelRadius),
      y: 0,
    }
  })

  const minY = cy - labelRadius + 6
  const maxY = cy + labelRadius - 6
  for (const isRight of [false, true]) {
    const side = positions.filter((position) => position.isRight === isRight).sort((a, b) => a.desiredY - b.desiredY)
    if (side.length === 0) continue
    const gap = side.length > 1 ? Math.min(17, (maxY - minY) / (side.length - 1)) : 0

    side[0].y = Math.max(minY, side[0].desiredY)
    for (let i = 1; i < side.length; i++) {
      side[i].y = Math.max(side[i].desiredY, side[i - 1].y + gap)
    }
    if (side.at(-1)!.y > maxY) {
      side[side.length - 1].y = maxY
      for (let i = side.length - 2; i >= 0; i--) {
        side[i].y = Math.min(side[i].y, side[i + 1].y - gap)
      }
    }
    if (side[0].y < minY) {
      const shift = minY - side[0].y
      side.forEach((position) => { position.y += shift })
    }
  }

  return positions.sort((a, b) => a.index - b.index)
}

function AccountTypeLabel({ data, ...props }: PieLabelRenderProps & { data: DonutPoint[] }) {
  const { cx, cy, midAngle, outerRadius, payload, percent, index } = props
  if (typeof cx !== 'number' || typeof cy !== 'number' || typeof midAngle !== 'number' || typeof outerRadius !== 'number') return null
  const point = payload as DonutPoint
  const position = resolveLabelPositions(data, cx, cy, outerRadius)[index]
  if (!position) return null

  const radians = -midAngle * Math.PI / 180
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
        {point.account_type} · {((percent ?? 0) * 100).toFixed(0)}%
      </text>
    </g>
  )
}

function AccountTypeSector({ cx, cy, startAngle, endAngle, outerRadius, payload }: PieSectorShapeProps) {
  const point = payload as DonutPoint
  const radius = outerRadius ?? 0
  const accountColor = catColor(point.account_type)
  const sectorBase = {
    cx,
    cy,
    startAngle,
    endAngle,
    stroke: 'var(--card-bg, #111827)',
    strokeWidth: 0.5,
    strokeOpacity: 0.7,
  }

  if (point.unrealized_gain < 0) {
    const lossRatio = point.total_cost_basis > 0
      ? Math.min(Math.abs(point.unrealized_gain) / point.total_cost_basis, 0.95)
      : 1
    const lossInnerRadius = radius * Math.sqrt(1 - lossRatio)
    return (
      <g>
        <Sector {...sectorBase} innerRadius={0} outerRadius={radius} fill={accountColor} fillOpacity={0.48} />
        <Sector {...sectorBase} innerRadius={lossInnerRadius} outerRadius={radius} fill={SEMANTIC_COLORS.performancePositive} fillOpacity={0.68} />
      </g>
    )
  }

  const positiveTotal = point.total_cost_basis + point.unrealized_gain
  const costRatio = positiveTotal > 0 ? Math.min(point.total_cost_basis / positiveTotal, 1) : 0
  const splitRadius = radius * Math.sqrt(costRatio)
  return (
    <g>
      {splitRadius > 0 && (
        <Sector {...sectorBase} innerRadius={0} outerRadius={splitRadius} fill={accountColor} fillOpacity={0.48} />
      )}
      {point.unrealized_gain > 0 && (
        <Sector {...sectorBase} innerRadius={splitRadius} outerRadius={radius} fill={SEMANTIC_COLORS.performancePositive} fillOpacity={0.68} />
      )}
    </g>
  )
}

export function AccountTypeBreakdownChart({ data }: { data: AccountTypePointWithLabel[] }) {
  const donutData: DonutPoint[] = data.map((point) => ({
    ...point,
    total_cost_basis: Math.max(0, point.total_cost_basis),
  }))
  const pieData = donutData.filter((point) => point.total_value > 0)
  const totalValue = data.reduce((sum, point) => sum + point.total_value, 0)

  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400">Breakdown by account type</h2>
      <p className="mt-1 text-xs text-gray-600">Each slice is an account type · Radial split: cost basis / unrealized P&amp;L</p>

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
            label={(props) => <AccountTypeLabel {...props} data={pieData} />}
            labelLine={false}
          />
          <Tooltip content={<AccountTypeTooltip portfolioTotal={totalValue} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
