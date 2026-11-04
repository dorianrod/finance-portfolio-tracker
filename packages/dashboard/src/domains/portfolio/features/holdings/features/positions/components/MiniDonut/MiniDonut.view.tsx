import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { PieTooltip } from '@/domains/portfolio/shared/components/allocationChartTooltips/PieTooltip.view'
import { useFormatPieEntryLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatPieEntryLabel'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

import { MiniDonutLegendItem } from './MiniDonutLegendItem.view'
import { MiniDonutSector } from './MiniDonutSector.view'

export function MiniDonutView({
  title,
  data,
  total,
}: {
  title: string
  data: PieEntry[]
  total: number
}) {
  const formatLabel = useFormatPieEntryLabel()
  const chartData = data.map((entry) => ({
    ...entry,
    name: formatLabel(entry),
  }))
  const legendEntries = data.map((entry) => ({
    entry,
    key: JSON.stringify([Boolean(entry.subItems), entry.name]),
  }))
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
            data={chartData}
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
        {legendEntries.map((item) => (
          <MiniDonutLegendItem
            key={item.key}
            entry={item.entry}
            total={total}
          />
        ))}
      </Inline>
    </div>
  )
}
