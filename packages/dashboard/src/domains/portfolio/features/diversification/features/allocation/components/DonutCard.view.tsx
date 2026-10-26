import type { ReactNode } from 'react'
import {
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/allocationChartTooltips/PieTooltip.view'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
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
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
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
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <SeriesPie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="32%"
            outerRadius="50%"
            paddingAngle={1}
            labelConnector
            onClick={(_entry, index) => onSelect(data[index])}
            interactive
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
    <ChartSector
      geometry={shapeProps}
      tone={getAllocationTone(entry.name)}
      dimmed={isFiltered && activeCategory !== entry.name}
      selected={activeCategory === entry.name}
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
