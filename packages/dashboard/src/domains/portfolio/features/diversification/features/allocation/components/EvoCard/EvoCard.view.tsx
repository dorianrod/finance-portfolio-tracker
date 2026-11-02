import { type ReactNode, useId } from 'react'
import { AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import type {
  AllocationTrend,
  AllocationTrendCategory,
  AllocationTrendPoint,
} from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/types/allocationTrend.type'
import { EvolutionTooltip } from '@/domains/portfolio/features/diversification/features/allocation/components/EvolutionTooltip.view'
import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { useFormatAllocationTrendCategory } from './helpers/formatters/useFormatAllocationTrendCategory'
import type { AllocationTrendSeries } from './types/allocationTrendSeries.type'

export function EvoCardView({
  title,
  trend,
  dateDomain,
  activeCategory,
  isFiltered,
  onSelect,
  children,
}: {
  children: ReactNode
  title: string
  trend: AllocationTrend
  dateDomain: [number, number]
  // No category in this chart dimension is selected.
  activeCategory: string | null
  isFiltered: boolean
  onSelect: (category: string) => void
}) {
  const { slot: tooltip, content: remainingChildren } = partitionSlot(
    children,
    EvoCardViewTooltip,
  )
  const { slot: positionsControl } = partitionSlot(
    remainingChildren,
    EvoCardViewPositionsControl,
  )
  const formatCategory = useFormatAllocationTrendCategory()
  const { categories, rows: chartData } = trend
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  const id = useId()
  const series: AllocationTrendSeries[] = categories.map((category, index) => ({
    category,
    index,
    label: formatCategory(category),
    gradientId: `${id}-allocation-${index}`,
  }))
  return (
    <Surface variant="chart">
      <Inline
        as="div"
        spaceAfter="default"
        align="start"
        justify="between"
        gap="default"
      >
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {title}
            {tooltip}
          </Inline>
        </Text>
        {positionsControl}
      </Inline>
      <Inline as="div" flow="wrap" gap="compact" spaceAfter="default">
        {series.map((item) => (
          <EvolutionLegendItem
            key={item.index}
            activeCategory={activeCategory}
            category={item.category}
            label={item.label}
            isFiltered={isFiltered}
            onSelect={onSelect}
          />
        ))}
      </Inline>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((item) => (
              <EvolutionGradient
                key={item.index}
                category={item.category}
                gradientId={item.gradientId}
              />
            ))}
          </defs>
          <ChartGrid />
          <ChartXAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={dateDomain}
            allowDataOverflow
            tickFormatter={(timestamp) =>
              formatDate(timestamp, { style: 'shortMonthShortYear' })
            }
          />
          <ChartYAxis
            tickFormatter={(v) => formatPercentage(v, { decimals: 'auto' })}
            domain={[0, 100]}
            width={36}
          />
          <Tooltip content={<EvolutionTooltip series={series} />} />
          {series.map((item) => (
            <EvolutionArea
              key={item.index}
              category={item.category}
              index={item.index}
              label={item.label}
              gradientId={item.gradientId}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function EvolutionLegendItem({
  activeCategory,
  category,
  label,
  isFiltered,
  onSelect,
}: {
  activeCategory: string | null
  category: AllocationTrendCategory
  label: string
  isFiltered: boolean
  onSelect: (category: string) => void
}) {
  const categoryName = category.kind === 'category' ? category.name : ''
  const aggregate = category.kind === 'group'
  if (category.kind === 'group')
    return (
      <Text variant="micro" tone="subtle">
        <Inline as="span" align="center" gap="compact">
          <AllocationCategory.Swatch
            category={categoryName}
            aggregate={aggregate}
            shape="bar"
            size="default"
          />
          {label}
        </Inline>
      </Text>
    )
  const isActive = activeCategory === category.name
  const isDimmed = isFiltered && !isActive
  return (
    <ToggleButton
      type="button"
      active={isActive}
      onClick={() => onSelect(category.name)}
      variant="legend"
      dimmed={isDimmed}
    >
      <AllocationCategory.Swatch
        category={categoryName}
        aggregate={aggregate}
        shape="bar"
        selected={isActive}
        size="default"
      />
      <AllocationCategory category={categoryName} aggregate={aggregate}>
        {label}
      </AllocationCategory>
    </ToggleButton>
  )
}

function EvolutionGradient({
  category,
  gradientId,
}: {
  category: AllocationTrendCategory
  gradientId: string
}) {
  return (
    <AllocationCategory.Gradient
      id={gradientId}
      profile="dense"
      category={category.kind === 'category' ? category.name : ''}
      aggregate={category.kind === 'group'}
    />
  )
}

function EvolutionArea({
  category,
  gradientId,
  index,
  label,
}: {
  category: AllocationTrendCategory
  index: number
  label: string
  gradientId: string
}) {
  return (
    <AllocationCategory.Area
      type="monotone"
      dataKey={(point: AllocationTrendPoint) => point.values[index]}
      name={label}
      stackId="a"
      category={category.kind === 'category' ? category.name : ''}
      aggregate={category.kind === 'group'}
      gradientId={`${gradientId}`}
      weight="fine"
    />
  )
}

function EvoCardViewTooltip({ children }: { children: ReactNode }) {
  return children
}

EvoCardView.Tooltip = EvoCardViewTooltip

function EvoCardViewPositionsControl({ children }: { children: ReactNode }) {
  return children
}

EvoCardView.PositionsControl = EvoCardViewPositionsControl
