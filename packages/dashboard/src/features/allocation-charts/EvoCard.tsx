import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { shortMonth } from '@/shared/format/money'
import { catColor } from '@/shared/format/colors'
import type { AllocationPoint } from '@/hooks/useAllocationData'
import { groupTail } from './allocationCharts.logic'
import { EvolutionTooltip } from './allocationCharts.tooltips'
import type { AllocationDimension, AllocationFilter } from './allocationCharts.types'

interface EvoCardProps {
  title: string
  points: AllocationPoint[]
  dimension: AllocationDimension
  activeFilter: AllocationFilter | null
  onFilterToggle: (filter: AllocationFilter) => void
}

export function EvoCard({ title, points, dimension, activeFilter, onFilterToggle }: EvoCardProps) {
  const last = points[points.length - 1]
  const { main, grouped } = groupTail(last.categories)
  const groupedNames = new Set(grouped.map((c) => c.name))
  const groupedKey = grouped.length > 1 ? `others (${grouped.length})` : null
  const categories = [...main.map((c) => c.name), ...(groupedKey ? [groupedKey] : [])]

  const chartData = points.map((pt) => {
    const rowTotal = pt.categories.reduce((s, c) => s + c.value, 0)
    const row: Record<string, string | number> = { date: pt.date }
    for (const cat of main.map((c) => c.name)) {
      const v = pt.categories.find((c) => c.name === cat)?.value ?? 0
      row[cat] = rowTotal > 0 ? parseFloat(((v / rowTotal) * 100).toFixed(2)) : 0
    }
    if (groupedKey) {
      const groupedVal = pt.categories.filter((c) => groupedNames.has(c.name)).reduce((s, c) => s + c.value, 0)
      row[groupedKey] = rowTotal > 0 ? parseFloat(((groupedVal / rowTotal) * 100).toFixed(2)) : 0
    }
    return row
  })

  const activeSeg = activeFilter?.type === dimension ? activeFilter.value : null

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-2">{title}</h2>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {categories.map((cat) => {
          if (cat.startsWith('others (')) return (
            <span key={cat} className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: catColor(cat), display: 'inline-block', flexShrink: 0 }} />
              {cat}
            </span>
          )
          const isActive = activeSeg === cat
          const isDimmed = activeFilter !== null && !isActive
          return (
            <button
              key={cat}
              onClick={() => onFilterToggle({ type: dimension, value: cat })}
              className="inline-flex items-center gap-1 text-[11px] transition-opacity cursor-pointer"
              style={{ opacity: isDimmed ? 0.35 : 1 }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: 2, background: catColor(cat),
                display: 'inline-block', flexShrink: 0,
                outline: isActive ? '2px solid white' : 'none', outlineOffset: 1,
              }} />
              <span style={{ color: catColor(cat) }}>{cat}</span>
            </button>
          )
        })}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {categories.map((cat, i) => (
              <linearGradient key={cat} id={`alloc-grad-${title.replace(/[^a-zA-Z0-9_-]/g, '-')}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={catColor(cat)} stopOpacity={0.8} />
                <stop offset="95%" stopColor={catColor(cat)} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip content={(props) => <EvolutionTooltip {...props} categories={categories} />} />
          {categories.map((cat, i) => (
            <Area
              key={cat}
              type="monotone"
              dataKey={cat}
              stackId="a"
              stroke={catColor(cat)}
              fill={`url(#alloc-grad-${title.replace(/[^a-zA-Z0-9_-]/g, '-')}-${i})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
