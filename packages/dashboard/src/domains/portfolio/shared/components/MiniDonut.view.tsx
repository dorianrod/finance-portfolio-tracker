import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { catColor } from '@/shared/theme/chartColors'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocation'
import { formatGroupedAllocationLabel, groupAllocationTail } from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail'
import { PieTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import type { PieEntry } from '@/domains/portfolio/shared/types/allocationCharts.types'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

function MiniDonutCell({ entry }: { entry: PieEntry }) {
  return <Cell fill={catColor(entry.name)} />
}

function MiniDonutLegendItem({ entry, total }: { entry: PieEntry; total: number }) {
  const formatPercentage = useFormatPercentage()
  const percentage = formatPercentage(total > 0 ? (entry.value / total) * 100 : 0, { decimals: 0 })

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(entry.name), display: 'inline-block', flexShrink: 0 }} />
      {entry.name} {percentage}
    </span>
  )
}

export function MiniDonut({ title, point }: { title: string; point: AllocationPoint }) {
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const { main, grouped } = groupAllocationTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [{ name: formatGroupedAllocationLabel(grouped.length), value: groupedTotal, total, subItems: grouped }]
      : []),
  ]
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">{title}</p>
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="30%" outerRadius="56%" paddingAngle={1}>
            {data.map((entry) => <MiniDonutCell key={entry.name} entry={entry} />)}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {data.map((entry) => <MiniDonutLegendItem key={entry.name} entry={entry} total={total} />)}
      </div>
    </div>
  )
}
