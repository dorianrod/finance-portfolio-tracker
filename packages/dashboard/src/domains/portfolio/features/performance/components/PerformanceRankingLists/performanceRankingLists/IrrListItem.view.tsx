import { getIrrBarShare } from '@/domains/portfolio/features/performance/components/PerformanceRankingLists/helpers/presenters/getIrrBarShare'
import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function IrrListItem({
  item,
  positive,
  strongestIrr,
}: {
  item: AssetIrrItem
  positive: boolean
  strongestIrr: number
}) {
  const formatAssetLabel = useFormatAssetLabel()
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
              {formatAssetLabel(item, item.label)}
            </Text>
            <Text
              as="div"
              variant="micro"
              tone="subtle"
              truncate
              title={item.accounts.join(', ')}
            >
              {item.account_types.join(', ') || item.accounts.join(', ')}
            </Text>
          </Layout>
          <Layout sizing="fixed">
            <Text as="div" align="right" numeric>
              <Text as="div" variant="strong" tone={tone}>
                {formatPercentage(item.irr, { decimals: 2, signed: true })}
              </Text>
              <Text as="div" variant="micro" tone="subtle">
                {i18n.t('ui.performancecontributioncard.valueWithValues', {
                  amount: formatMoney(item.value, { style: 'full' }),
                })}
              </Text>
            </Text>
          </Layout>
        </Inline>
      </Text>
      <Layout spaceBefore="default" height="track" overflow="clip">
        <Surface variant="track">
          <Proportion value={getIrrBarShare(item.irr, strongestIrr)}>
            <ToneSwatch as="div" shape="dot" tone={tone} />
          </Proportion>
        </Surface>
      </Layout>
    </li>
  )
}
