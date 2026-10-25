import {
  Pie,
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import {
  formatGroupedAllocationLabel,
  groupAllocationTail,
} from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail'
import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { catColor } from '@/shared/theme/chartColors'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

function MiniDonutLegendItem({
  entry,
  total,
}: {
  entry: PieEntry
  total: number
}) {
  const formatPercentage = useFormatPercentage()
  const percentage = formatPercentage(
    total > 0 ? (entry.value / total) * 100 : 0,
    { decimals: 0 },
  )

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-content-muted">
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: catColor(entry.name),
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {entry.name} {percentage}
    </span>
  )
}

export function MiniDonut({
  title,
  point,
}: {
  title: string
  point: AllocationPoint
}) {
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const { main, grouped } = groupAllocationTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [
          {
            name: formatGroupedAllocationLabel(grouped.length),
            value: groupedTotal,
            total,
            subItems: grouped,
          },
        ]
      : []),
  ]
  return (
    <div>
      <p className="text-[11px] font-semibold text-content-muted mb-1 uppercase tracking-wide">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="30%"
            outerRadius="56%"
            paddingAngle={1}
            shape={MiniDonutSector}
          />
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {data.map((entry) => (
          <MiniDonutLegendItem key={entry.name} entry={entry} total={total} />
        ))}
      </div>
    </div>
  )
}

function MiniDonutSector(
  shapeProps: ChartShapeProps<PieSectorShapeProps, PieEntry>,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return <Sector {...shapeProps} fill={catColor(entry.name)} />
}
