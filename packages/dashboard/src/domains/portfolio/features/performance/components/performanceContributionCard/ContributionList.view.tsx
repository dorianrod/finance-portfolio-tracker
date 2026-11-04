import type { ReactNode } from 'react'

import { ContributionListItem } from '@/domains/portfolio/features/performance/components/PerformanceRankingLists/performanceRankingLists/ContributionListItem.view'
import type { PerformanceContribution } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function ContributionListView({
  title,
  items,
  positive,
  children,
}: {
  title: string
  items: PerformanceContribution[]
  positive: boolean
  children: ReactNode
}) {
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
          <Inline as="span" align="center">
            {title}
            {children}
          </Inline>
        </Text>
        <Text variant="micro" tone="subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.shareOfGains')
            : i18n.t('ui.performancecontributioncard.shareOfLosses')}
        </Text>
      </Inline>
      {items.length === 0 ? (
        <Surface variant="emptyCaption" as="p" tone="subtle" align="center">
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveContribution')
            : i18n.t('ui.performancecontributioncard.noNegativeContribution')}
        </Surface>
      ) : (
        <Stack as="ol" gap="default">
          {items.map((item) => (
            <ContributionListItem
              key={item.key}
              item={item}
              positive={positive}
            />
          ))}
        </Stack>
      )}
    </section>
  )
}
