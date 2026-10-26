import type { PerformanceContribution } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { Proportion } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import { getIrrBarShare } from './helpers/presenters/getIrrBarShare'

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

export function IrrList({
  title,
  items,
  positive,
}: {
  title: string
  items: AssetIrrItem[]
  positive: boolean
}) {
  const strongestIrr = Math.max(0, ...items.map((item) => Math.abs(item.irr)))

  return (
    <section>
      <Inline
        as="div"
        spaceAfter="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text as="h3" variant="overline" tone="subtle">
          {title}
        </Text>
        <Text variant="micro" tone="subtle">
          {i18n.t('ui.performancecontributioncard.annualizedIrr')}
        </Text>
      </Inline>
      {items.length === 0 ? (
        <Surface variant="emptyCaption" as="p" tone="subtle" align="center">
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveIrr')
            : i18n.t('ui.performancecontributioncard.noNegativeIrr')}
        </Surface>
      ) : (
        <Stack as="ol" gap="default">
          {items.map((item) => (
            <IrrListItem
              key={item.key}
              item={item}
              positive={positive}
              strongestIrr={strongestIrr}
            />
          ))}
        </Stack>
      )}
    </section>
  )
}
