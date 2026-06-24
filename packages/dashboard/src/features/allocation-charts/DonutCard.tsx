import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtFull } from '@/shared/format/money'
import { catColor } from '@/shared/format/colors'
import type { AllocationPoint } from '@/hooks/useAllocationData'
import { groupTail } from './allocationCharts.logic'
import { PieTooltip } from './allocationCharts.tooltips'
import { PieLabel } from './PieLabel'
import type { AllocationDimension, AllocationFilter, PieEntry } from './allocationCharts.types'

interface DonutCardProps {
  title: string
  point: AllocationPoint
  dimension: AllocationDimension
  activeFilter: AllocationFilter | null
  onFilterToggle: (filter: AllocationFilter) => void
}

export function DonutCard({ title, point, dimension, activeFilter, onFilterToggle }: DonutCardProps) {
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const dateLabel = new Date(point.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const { main, grouped } = groupTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [{ name: `others (${grouped.length})`, value: groupedTotal, total, subItems: grouped }]
      : []),
  ]

  const activeSeg = activeFilter?.type === dimension ? activeFilter.value : null

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-sm font-medium text-gray-400">{title}</h2>
        <span className="text-xs text-gray-600">{dateLabel}</span>
      </div>
      <div className="text-xs text-gray-500 mb-1">Allocated: {fmtFull(total)}</div>
      <div className="text-xs text-gray-600 mb-2">Click a segment to filter</div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="32%"
            outerRadius="50%"
            paddingAngle={1}
            label={PieLabel}
            labelLine={{ stroke: '#4b5563', strokeWidth: 1 }}
            onClick={(entry: unknown) => {
              if (!(entry as PieEntry).name.startsWith('others (')) {
                onFilterToggle({ type: dimension, value: (entry as PieEntry).name })
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry) => {
              const isActive = activeSeg === entry.name
              const isDimmed = activeFilter !== null && !isActive
              return (
                <Cell
                  key={entry.name}
                  fill={catColor(entry.name)}
                  opacity={isDimmed ? 0.25 : 1}
                  stroke={isActive ? '#ffffff' : 'none'}
                  strokeWidth={isActive ? 2 : 0}
                />
              )
            })}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
