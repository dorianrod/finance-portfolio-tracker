import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { catColor } from '@/shared/format/colors'
import type { AllocationPoint } from '@/hooks/useAllocationData'
import { groupTail } from './allocationCharts.logic'
import { PieTooltip } from './allocationCharts.tooltips'
import type { PieEntry } from './allocationCharts.types'

export function MiniDonut({ title, point }: { title: string; point: AllocationPoint }) {
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const { main, grouped } = groupTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [{ name: `others (${grouped.length})`, value: groupedTotal, total, subItems: grouped }]
      : []),
  ]
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">{title}</p>
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="30%" outerRadius="56%" paddingAngle={1}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={catColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0'
          return (
            <span key={entry.name} className="inline-flex items-center gap-1 text-[10px] text-gray-400">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(entry.name), display: 'inline-block', flexShrink: 0 }} />
              {entry.name} {pct}%
            </span>
          )
        })}
      </div>
    </div>
  )
}
