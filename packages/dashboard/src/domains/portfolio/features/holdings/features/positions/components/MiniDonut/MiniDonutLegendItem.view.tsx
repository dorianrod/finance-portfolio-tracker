import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import { useFormatPieEntryLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatPieEntryLabel'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Text } from '@/shared/ui/Text.view'

export function MiniDonutLegendItem({
  entry,
  total,
}: {
  entry: PieEntry
  total: number
}) {
  const formatLabel = useFormatPieEntryLabel()
  const formatPercentage = useFormatPercentage()
  const percentage = formatPercentage(
    total > 0 ? (entry.value / total) * 100 : 0,
    { decimals: 0 },
  )

  return (
    <Text variant="tiny" tone="muted">
      <Inline as="span" align="center" gap="compact">
        <AllocationCategory.Swatch
          category={entry.name}
          aggregate={(entry.subItems?.length ?? 0) > 1}
          shape="dot"
          size="default"
        />
        {formatLabel(entry)} {percentage}
      </Inline>
    </Text>
  )
}
