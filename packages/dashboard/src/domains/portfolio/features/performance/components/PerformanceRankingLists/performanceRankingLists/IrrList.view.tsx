import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { IrrListItem } from './IrrListItem.view'

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
