import type { PerformanceContribution } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import type { AssetIrrItem } from '@/domains/portfolio/shared/types/assetIrr.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import { getIrrBarWidth } from './helpers/presenters/getIrrBarWidth'

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
      <Text
        as="div"
        variant="body"
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
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
        </div>
        <Text as="div" align="right" numeric className="shrink-0">
          <Text as="div" variant="strong" tone={tone}>
            {formatMoney(item.amount, { style: 'full' })}
          </Text>
          <Text as="div" variant="micro" tone="subtle">
            {formatPercentage(item.share)}
          </Text>
        </Text>
      </Text>
      <Surface variant="track" className="mt-1.5 h-1 overflow-hidden">
        <ToneSwatch
          as="div"
          shape="dot"
          tone={tone}
          className="h-full"
          style={{ width: `${Math.min(item.share, 100)}%` }}
        />
      </Surface>
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
      <Text
        as="div"
        variant="body"
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
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
        </div>
        <Text as="div" align="right" numeric className="shrink-0">
          <Text as="div" variant="strong" tone={tone}>
            {formatPercentage(item.irr, { decimals: 2, signed: true })}
          </Text>
          <Text as="div" variant="micro" tone="subtle">
            {i18n.t('ui.performancecontributioncard.valueWithValues', {
              amount: formatMoney(item.value, { style: 'full' }),
            })}
          </Text>
        </Text>
      </Text>
      <Surface variant="track" className="mt-1.5 h-1 overflow-hidden">
        <ToneSwatch
          as="div"
          shape="dot"
          tone={tone}
          className="h-full"
          style={{
            width: getIrrBarWidth(item.irr, strongestIrr),
          }}
        />
      </Surface>
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
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <Text as="h3" variant="overline" tone="subtle">
          {title}
        </Text>
        <Text variant="micro" tone="subtle">
          {i18n.t('ui.performancecontributioncard.annualizedIrr')}
        </Text>
      </div>
      {items.length === 0 ? (
        <Surface
          variant="emptyCaption"
          as="p"
          tone="subtle"
          align="center"
          className="px-3 py-6"
        >
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveIrr')
            : i18n.t('ui.performancecontributioncard.noNegativeIrr')}
        </Surface>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <IrrListItem
              key={item.key}
              item={item}
              positive={positive}
              strongestIrr={strongestIrr}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
