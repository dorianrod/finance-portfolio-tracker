import { type ReactNode, useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EvolutionTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { catColor } from '@/shared/theme/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'

function EvolutionLegendItem({
  activeCategory,
  category,
  groupedCategory,
  isFiltered,
  onSelect,
}: {
  activeCategory: string | null
  category: string
  groupedCategory: string | null
  isFiltered: boolean
  onSelect: (category: string) => void
}) {
  const color = catColor(category)
  if (category === groupedCategory)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-content-subtle">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        {category}
      </span>
    )
  const isActive = activeCategory === category
  const isDimmed = isFiltered && !isActive
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(category)}
      className="inline-flex cursor-pointer items-center gap-1 text-[11px] transition-opacity"
      style={{ opacity: isDimmed ? 0.35 : 1 }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          display: 'inline-block',
          flexShrink: 0,
          outline: isActive ? '2px solid var(--ds-content)' : 'none',
          outlineOffset: 1,
        }}
      />
      <span style={{ color }}>{category}</span>
    </button>
  )
}

function EvolutionGradient({
  category,
  gradientId,
}: {
  category: string
  gradientId: string
}) {
  return (
    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={catColor(category)} stopOpacity={0.8} />
      <stop offset="95%" stopColor={catColor(category)} stopOpacity={0.4} />
    </linearGradient>
  )
}

function EvolutionArea({
  category,
  gradientId,
}: {
  category: string
  gradientId: string
}) {
  return (
    <Area
      type="monotone"
      dataKey={category}
      stackId="a"
      stroke={catColor(category)}
      fill={`url(#${gradientId})`}
      strokeWidth={1.5}
    />
  )
}

export function EvoCardView({
  title,
  categories,
  chartData,
  groupedCategory,
  dateDomain,
  activeCategory,
  isFiltered,
  onSelect,
  tooltip,
  positionsControl,
}: {
  title: string
  categories: string[]
  chartData: Array<Record<string, number | null>>
  groupedCategory: string | null
  dateDomain: [number, number]
  activeCategory: string | null
  isFiltered: boolean
  onSelect: (category: string) => void
  tooltip: ReactNode
  positionsControl: ReactNode
}) {
  const formatDate = useFormatDate()
  const id = useId()
  const series = categories.map((category, index) => ({
    category,
    gradientId: `${id}-allocation-${index}`,
  }))
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-content-muted">
          {title}
          {tooltip}
        </h2>
        {positionsControl}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {categories.map((category) => (
          <EvolutionLegendItem
            key={category}
            activeCategory={activeCategory}
            category={category}
            groupedCategory={groupedCategory}
            isFiltered={isFiltered}
            onSelect={onSelect}
          />
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((item) => (
              <EvolutionGradient
                key={item.category}
                category={item.category}
                gradientId={item.gradientId}
              />
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={dateDomain}
            allowDataOverflow
            tickFormatter={(timestamp) =>
              formatDate(timestamp, { style: 'shortMonthShortYear' })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip content={<EvolutionTooltip categories={categories} />} />
          {series.map((item) => (
            <EvolutionArea
              key={item.category}
              category={item.category}
              gradientId={item.gradientId}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
