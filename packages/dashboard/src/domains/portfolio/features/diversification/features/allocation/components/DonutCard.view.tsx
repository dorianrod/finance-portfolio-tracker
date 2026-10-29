import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import type { ReactNode } from 'react'
import {
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/allocationChartTooltips/PieTooltip.view'
import { useFormatPieEntryLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatPieEntryLabel'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesPie } from '@/shared/ui/SeriesPie.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { PieLabel } from './PieLabel/PieLabel.view'

export function DonutCardView({
  title,
  date,
  total,
  data,
  activeCategory,
  isFiltered,
  onSelect,
  children,
}: {
  children: ReactNode
  title: string
  date: Date
  total: number
  data: PieEntry[]
  activeCategory: string | null
  isFiltered: boolean
  onSelect: (entry: PieEntry | undefined) => void
}) {
  const { slot: tooltip, content: remainingChildren } = partitionSlot(
    children,
    DonutCardViewTooltip,
  )
  const { slot: positionsControl } = partitionSlot(
    remainingChildren,
    DonutCardViewPositionsControl,
  )
  const formatLabel = useFormatPieEntryLabel()
  const chartData = data.map((entry) => ({
    ...entry,
    name: formatLabel(entry),
  }))
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const legendEntries = data.map((entry) => ({
    entry,
    key: JSON.stringify([Boolean(entry.subItems?.length), entry.name]),
  }))
  const dateLabel = formatDate(date, { style: 'longMonthYear' })
  return (
    <Surface variant="chart">
      <Inline
        as="div"
        spaceAfter="compact"
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
        <Inline as="div" sizing="fixed" align="center" gap="default">
          <Text variant="caption" tone="subtle">
            {dateLabel}
          </Text>
          {positionsControl}
        </Inline>
      </Inline>
      <Layout spaceAfter="compact">
        <Text as="div" variant="caption" tone="subtle">
          {i18n.t('ui.donutcard.allocatedWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </Text>
      </Layout>
      <Layout spaceAfter="default">
        <Text as="div" variant="caption" tone="subtle">
          {i18n.t('ui.donutcard.clickASegmentToFilter')}
        </Text>
      </Layout>
      <Inline as="div" flow="wrap" gap="compact" spaceAfter="default">
        {legendEntries.map((item) => (
          <DonutLegendItem
            key={item.key}
            entry={item.entry}
            activeCategory={activeCategory}
            isFiltered={isFiltered}
            onSelect={onSelect}
          />
        ))}
      </Inline>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <SeriesPie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="32%"
            outerRadius="50%"
            paddingAngle={1}
            labelConnector
            onClick={(_entry, index) => onSelect(data[index])}
          >
            <SeriesPie.Labels>
              <PieLabel />
            </SeriesPie.Labels>
            <SeriesPie.Shape>
              <DonutSector
                activeCategory={activeCategory}
                isFiltered={isFiltered}
              />
            </SeriesPie.Shape>
          </SeriesPie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function DonutLegendItem({
  entry,
  activeCategory,
  isFiltered,
  onSelect,
}: {
  entry: PieEntry
  activeCategory: string | null
  isFiltered: boolean
  onSelect: (entry: PieEntry) => void
}) {
  const formatLabel = useFormatPieEntryLabel()
  const label = formatLabel(entry)
  if ((entry.subItems?.length ?? 0) > 0)
    return (
      <Text variant="micro" tone="subtle">
        <Inline as="span" align="center" gap="compact">
          <AllocationCategory.Swatch category={entry.name} aggregate={(entry.subItems?.length ?? 0) > 1} shape="bar" size="default" />
          {label}
        </Inline>
      </Text>
    )
  const active = activeCategory === entry.name
  return (
    <ToggleButton
      type="button"
      active={active}
      onClick={() => onSelect(entry)}
      variant="legend"
      dimmed={isFiltered && !active}
    >
      <AllocationCategory.Swatch category={entry.name} aggregate={(entry.subItems?.length ?? 0) > 1} shape="bar" size="default" selected={active} />
      {label}
    </ToggleButton>
  )
}

function DonutSector({
  activeCategory,
  isFiltered,
  ...shapeProps
}: Partial<ChartShapeProps<PieSectorShapeProps, PieEntry>> & {
  activeCategory: string | null
  isFiltered: boolean
}) {
  const entry = shapeProps.payload
  if (!entry) return null
  return (
    <AllocationCategory.Sector
      geometry={shapeProps}
      category={entry.name} aggregate={(entry.subItems?.length ?? 0) > 1}
      dimmed={isFiltered && activeCategory !== entry.name}
      selected={!entry.subItems && activeCategory === entry.name}
    />
  )
}

function DonutCardViewTooltip({ children }: { children: ReactNode }) {
  return children
}

DonutCardView.Tooltip = DonutCardViewTooltip

function DonutCardViewPositionsControl({ children }: { children: ReactNode }) {
  return children
}

DonutCardView.PositionsControl = DonutCardViewPositionsControl
