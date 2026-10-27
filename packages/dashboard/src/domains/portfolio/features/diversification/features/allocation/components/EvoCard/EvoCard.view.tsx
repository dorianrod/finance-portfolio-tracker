import { type ReactNode, useId } from 'react'
import { AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import { EvolutionTooltip } from '@/domains/portfolio/features/diversification/features/allocation/components/EvolutionTooltip.view'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

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
  const formatPercentage = useFormatPercentage()
  const id = useId()
  const series = categories.map((category, index) => ({
    category,
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
      </Inline>
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
            tickFormatter={(v) =>
              formatPercentage(Number(v), { decimals: 'auto' })
            }
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
      <Text variant="micro" tone="subtle">
        <Inline as="span" align="center" gap="compact">
          <SeriesSwatch
            tone={getAllocationTone(category)}
            shape="bar"
            size="default"
          />
          {category}
        </Inline>
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
    >
      <SeriesSwatch
        tone={getAllocationTone(category)}
        shape="bar"
        selected={isActive}
        size="default"
      />
      <ChartText tone={getAllocationTone(category)}>{category}</ChartText>
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
  return (
    <SeriesGradient
      id={gradientId}
      profile="dense"
      tone={getAllocationTone(category)}
    />
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
    <SeriesArea
      type="monotone"
      dataKey={category}
      stackId="a"
      tone={getAllocationTone(category)}
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
