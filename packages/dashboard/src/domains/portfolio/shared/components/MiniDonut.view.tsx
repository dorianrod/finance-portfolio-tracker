import {
  Pie,
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/AllocationChartTooltips.view'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone'
import {
  formatGroupedAllocationLabel,
  groupAllocationTail,
} from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail'
import type { PieEntry } from '@/domains/portfolio/shared/types/allocationChart.type'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

function MiniDonutLegendItem({
  entry,
  total,
}: {
  entry: PieEntry
  total: number
}) {
  const formatPercentage = useFormatPercentage()
  const percentage = formatPercentage(
    total > 0 ? (entry.value / total) * 100 : 0,
    { decimals: 0 },
  )

  return (
    <Text variant="tiny" tone="muted">
      <Inline as="span" align="center" gap="compact">
        <SeriesSwatch tone={getAllocationTone(entry.name)} shape="dot" size="default" />
        {entry.name} {percentage}
      </Inline>
    </Text>
  )
}

export function MiniDonut({
  title,
  point,
}: {
  title: string
  point: AllocationPoint
}) {
  const total = point.categories.reduce((s, c) => s + c.value, 0)
  const { main, grouped } = groupAllocationTail(point.categories)
  const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
  const data: PieEntry[] = [
    ...main.map((c) => ({ ...c, total })),
    ...(grouped.length > 1
      ? [
          {
            name: formatGroupedAllocationLabel(grouped.length),
            value: groupedTotal,
            total,
            subItems: grouped,
          },
        ]
      : []),
  ]
  return (
    <div>
      <Layout spaceAfter="compact">
        <Text as="p" variant="microSectionLabel" tone="muted">
          {title}
        </Text>
      </Layout>
      <ResponsiveContainer width="100%" height={110}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="30%"
            outerRadius="56%"
            paddingAngle={1}
            shape={MiniDonutSector}
          />
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <Inline as="div" flow="wrap" gap="compact" spaceBefore="compact">
        {data.map((entry) => (
          <MiniDonutLegendItem key={entry.name} entry={entry} total={total} />
        ))}
      </Inline>
    </div>
  )
}

function MiniDonutSector(
  shapeProps: ChartShapeProps<PieSectorShapeProps, PieEntry>,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return <ChartSector geometry={shapeProps} tone={getAllocationTone(entry.name)} />
}
