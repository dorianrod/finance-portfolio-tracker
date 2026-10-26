import type { PerformanceContribution } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function ContributionListItem({
  item,
  positive,
}: {
  item: PerformanceContribution
  positive: boolean
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const tone = positive ? 'positive' : 'negative'
  return (
    <li>
      <Text as="div" variant="body">
        <Inline as="div" align="start" justify="between" gap="relaxed">
          <Layout>
            <Text
              as="div"
              variant="medium"
              tone="secondary"
              truncate
              title={item.name}
            >
              {item.label}
            </Text>
            <Text
              as="div"
              variant="micro"
              tone="subtle"
              truncate
              title={item.accounts.join(', ')}
            >
              {item.accounts.join(', ')}
            </Text>
          </Layout>
          <Layout sizing="fixed">
            <Text as="div" align="right" numeric>
              <Text as="div" variant="strong" tone={tone}>
                {formatMoney(item.amount, { style: 'full' })}
              </Text>
              <Text as="div" variant="micro" tone="subtle">
                {formatPercentage(item.share)}
              </Text>
            </Text>
          </Layout>
        </Inline>
      </Text>
      <Layout spaceBefore="default" height="track" overflow="clip">
        <Surface variant="track">
          <Proportion value={Math.min(item.share, 100)}>
            <ToneSwatch as="div" shape="dot" tone={tone} />
          </Proportion>
        </Surface>
      </Layout>
    </li>
  )
}
