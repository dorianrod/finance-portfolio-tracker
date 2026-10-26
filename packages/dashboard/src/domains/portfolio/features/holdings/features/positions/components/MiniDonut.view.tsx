import {
  Pie,
  PieChart,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/allocationChartTooltips/PieTooltip.view'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import { buildAllocationPieData } from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail/buildAllocationPieData'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function MiniDonut({
  title,
  point,
}: {
  title: string
  point: AllocationPoint
}) {
  const { total, data } = buildAllocationPieData(point)
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
        <SeriesSwatch
          tone={getAllocationTone(entry.name)}
          shape="dot"
          size="default"
        />
        {entry.name} {percentage}
      </Inline>
    </Text>
  )
}

function MiniDonutSector(
  shapeProps: ChartShapeProps<PieSectorShapeProps, PieEntry>,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return (
    <ChartSector geometry={shapeProps} tone={getAllocationTone(entry.name)} />
  )
}
