import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline, Inset, Layout } from '@/shared/ui/Layout.view'
import { Proportion } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { StripedRow } from '@/shared/ui/TableRow.view'
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
      <Inset as="td" inset="default">
        <Layout>
          <Text
            as="div"
            variant="compactCaptionLabel"
            tone="secondary"
            truncate
          >
            {row.name}
          </Text>
        </Layout>
        <Text as="div" variant="micro" tone="subtle">
          {row.isin}
        </Text>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" variant="caption" tone="muted" align="right" numeric>
          {formatMoney(row.totalValue, { style: 'full' })}
        </Text>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" align="right">
          <Text as="div" variant="captionLabel" tone="secondary" numeric>
            {formatMoney(row.filteredValue, { style: 'full' })}
          </Text>
          <Inline
            as="div"
            spaceBefore="compact"
            align="center"
            justify="end"
            gap="compact"
          >
            <Layout height="track" overflow="clip">
              <Surface variant="track">
                <Proportion value={Math.min(percentage, 100)}>
                  <SeriesSwatch
                    as="div"
                    shape="dot"
                    tone={getAllocationTone(category)}
                  />
                </Proportion>
              </Surface>
            </Layout>
            <Layout as="span" flow="inline">
              <Text variant="micro" tone="subtle" align="right" numeric>
                {formatPercentage(percentage, { decimals: 0 })}
              </Text>
            </Layout>
          </Inline>
        </Text>
      </Inset>
    </StripedRow>
  )
}
