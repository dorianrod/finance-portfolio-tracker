import type { MatchingIsinRow } from '@/domains/portfolio/shared/types/allocationChart.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { StripedRow } from '@/shared/ui/PositionTable.view'
import { Surface } from '@/shared/ui/Surface.view'
import { CategorySwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

export function FilteredPositionRow({
  category,
  index,
  row,
}: {
  category: string
  index: number
  row: MatchingIsinRow
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const percentage =
    row.totalValue > 0 ? (row.filteredValue / row.totalValue) * 100 : 0
  return (
    <StripedRow shaded={index % 2 !== 0}>
      <td className="px-4 py-2.5">
        <Text
          as="div"
          variant="compactCaptionLabel"
          tone="secondary"
          truncate
          className="max-w-[180px]"
        >
          {row.name}
        </Text>
        <Text as="div" variant="micro" tone="subtle">
          {row.isin}
        </Text>
      </td>
      <Text
        as="td"
        variant="caption"
        tone="muted"
        align="right"
        numeric
        className="px-4 py-2.5"
      >
        {formatMoney(row.totalValue, { style: 'full' })}
      </Text>
      <Text as="td" align="right" className="px-4 py-2.5">
        <Text as="div" variant="captionLabel" tone="secondary" numeric>
          {formatMoney(row.filteredValue, { style: 'full' })}
        </Text>
        <div className="mt-0.5 flex items-center justify-end gap-1.5">
          <Surface variant="track" className="h-1 w-12 overflow-hidden">
            <CategorySwatch
              as="div"
              shape="dot"
              category={category}
              className="h-full"
              style={{
                width: `${Math.min(percentage, 100)}%`,
              }}
            />
          </Surface>
          <Text
            variant="micro"
            tone="subtle"
            align="right"
            numeric
            className="w-8"
          >
            {formatPercentage(percentage, { decimals: 0 })}
          </Text>
        </div>
      </Text>
    </StripedRow>
  )
}
