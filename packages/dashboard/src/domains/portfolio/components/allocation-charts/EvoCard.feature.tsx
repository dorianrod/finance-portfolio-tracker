import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useAtomValue } from 'jotai'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { catColor } from '@/shared/theme/chartColors'
import type { AllocationPoint } from '@/domains/portfolio/types/allocation'
import { allocationTrendDomain, buildAllocationTrend } from './allocationCharts.logic'
import { EvolutionTooltip } from './allocationCharts.tooltips.view'
import { PositionsToggle } from './PositionsToggle.view'
import type { AllocationDimension } from './allocationCharts.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import { useDashboardAllocationFilters } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationPositions'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'

interface EvoCardProps {
  title: string
  points: AllocationPoint[]
  dimension: AllocationDimension
}

function EvolutionLegendItem({ activeFilter, activeSegment, category, dimension }: { activeFilter: ReturnType<typeof useAtomValue<typeof dashboardAllocationFilterAtom>>; activeSegment: string | null; category: string; dimension: AllocationDimension }) {
  const { toggleFilter } = useDashboardAllocationFilters()
  const color = catColor(category)
  if (category.startsWith('others (')) return <span className="inline-flex items-center gap-1 text-[11px] text-gray-500"><span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0 }} />{category}</span>
  const isActive = activeSegment === category
  const isDimmed = activeFilter !== null && !isActive
  return <button type="button" onClick={() => toggleFilter({ type: dimension, value: category })} className="inline-flex cursor-pointer items-center gap-1 text-[11px] transition-opacity" style={{ opacity: isDimmed ? 0.35 : 1 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0, outline: isActive ? '2px solid white' : 'none', outlineOffset: 1 }} /><span style={{ color }}>{category}</span></button>
}

function EvolutionGradient({ category, gradientId }: { category: string; gradientId: string }) {
  return <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={catColor(category)} stopOpacity={0.8} /><stop offset="95%" stopColor={catColor(category)} stopOpacity={0.4} /></linearGradient>
}

function EvolutionArea({ category, gradientId }: { category: string; gradientId: string }) {
  return <Area type="monotone" dataKey={category} stackId="a" stroke={catColor(category)} fill={`url(#${gradientId})`} strokeWidth={1.5} />
}

export function EvoCard({ title, points, dimension }: EvoCardProps) {
  const formatDate = useFormatDate()
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const { togglePositions } = useDashboardAllocationPositions()
  const { categories, rows: chartData } = buildAllocationTrend(points)

  const activeSeg = activeFilter?.type === dimension ? activeFilter.value : null
  const dateDomain = allocationTrendDomain(points)
  const series = categories.map((category, index) => ({
    category,
    gradientId: `alloc-grad-${title.replace(/[^a-zA-Z0-9_-]/g, '-')}-${index}`,
  }))

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        {/* eslint-disable-next-line local/no-prop-drilling -- This feature owns the chart copy passed to the tooltip feature adapter. */}
        <h2 className="flex items-center text-sm font-medium text-gray-400">{title}<ScopedInfoTooltip text={`Historical portfolio allocation by ${title.toLowerCase()}.`} scope={{ account: 'filterable', period: 'range' }} /></h2>
        {activeFilter?.type === dimension && <PositionsToggle open={positionsOpen} onClick={togglePositions} />}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {categories.map((category) => <EvolutionLegendItem key={category} activeFilter={activeFilter} activeSegment={activeSeg} category={category} dimension={dimension} />)}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((item) => <EvolutionGradient key={item.category} category={item.category} gradientId={item.gradientId} />)}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={dateDomain}
            allowDataOverflow
            tickFormatter={(timestamp) => formatDate(timestamp, { style: 'shortMonthShortYear' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip content={<EvolutionTooltip categories={categories} />} />
          {series.map((item) => <EvolutionArea key={item.category} category={item.category} gradientId={item.gradientId} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
