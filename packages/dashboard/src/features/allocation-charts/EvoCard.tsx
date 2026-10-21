import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { catColor } from '@/shared/format/colors'
import type { AllocationPoint } from '@/hooks/useAllocationData'
import { allocationTrendDomain, buildAllocationTrend } from './allocationCharts.logic'
import { EvolutionTooltip } from './allocationCharts.tooltips'
import { PositionsToggle } from './PositionsToggle'
import type { AllocationDimension, AllocationFilter } from './allocationCharts.types'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'

interface EvoCardProps {
  title: string
  points: AllocationPoint[]
  dimension: AllocationDimension
  activeFilter: AllocationFilter | null
  onFilterToggle: (filter: AllocationFilter) => void
  onShowPositions?: () => void
  positionsOpen?: boolean
}

export function EvoCard({ title, points, dimension, activeFilter, onFilterToggle, onShowPositions, positionsOpen = false }: EvoCardProps) {
  const { categories, rows: chartData } = buildAllocationTrend(points)

  const activeSeg = activeFilter?.type === dimension ? activeFilter.value : null
  const dateDomain = allocationTrendDomain(points)

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-gray-400">{title}<InfoTooltip text={`Historical portfolio allocation by ${title.toLowerCase()}.`} scope={{ account: 'filterable', period: 'range' }} /></h2>
        {activeFilter?.type === dimension && onShowPositions && <PositionsToggle open={positionsOpen} onClick={onShowPositions} />}
      </div>
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
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={dateDomain}
            allowDataOverflow
            tickFormatter={(timestamp) => shortMonth(new Date(timestamp).toISOString())}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
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
