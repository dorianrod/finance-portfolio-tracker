import { type ReactNode, useId } from 'react'
import { AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import { EvolutionTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { ToggleButton } from '@/shared/ui/Controls.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { CategorySwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

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
  if (category === groupedCategory)
    return (
      <Text
        variant="micro"
        tone="subtle"
        className="inline-flex items-center gap-1"
      >
        <CategorySwatch
          category={category}
          shape="bar"
          style={{
            width: 8,
            height: 8,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        {category}
      </Text>
    )
  const isActive = activeCategory === category
  const isDimmed = isFiltered && !isActive
  return (
    <ToggleButton
      type="button"
      active={isActive}
      onClick={() => onSelect(category)}
      variant="legend"
      dimmed={isDimmed}
      className="inline-flex items-center gap-1"
    >
      <CategorySwatch
        category={category}
        shape="bar"
        selected={isActive}
        style={{ width: 8, height: 8, display: 'inline-block', flexShrink: 0 }}
      />
      <ChartText category={category}>{category}</ChartText>
    </ToggleButton>
  )
}

function EvolutionGradient({
  category,
  gradientId,
}: {
  category: string
  gradientId: string
}) {
  return <SeriesGradient id={gradientId} profile="dense" category={category} />
}

function EvolutionArea({
  category,
  gradientId,
}: {
  category: string
  gradientId: string
}) {
  return (
    <SeriesArea
      type="monotone"
      dataKey={category}
      stackId="a"
      category={category}
      gradientId={`${gradientId}`}
      weight="fine"
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
  children,
}: {
  children: ReactNode
  title: string
  categories: string[]
  chartData: Array<Record<string, number | null>>
  groupedCategory: string | null
  dateDomain: [number, number]
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
  const formatDate = useFormatDate()
  const id = useId()
  const series = categories.map((category, index) => ({
    category,
    gradientId: `${id}-allocation-${index}`,
  }))
  return (
    <Surface variant="chart" className="p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <Text
          as="h2"
          variant="label"
          tone="muted"
          className="flex items-center"
        >
          {title}
          {tooltip}
        </Text>
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
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}

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
    </Surface>
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
