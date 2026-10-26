import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { clearFilterGroup } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/clearFilterGroup'
import type { FilterSummaryItem } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/portfolioFilters.types'
import { filterSummariesForTab } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/filterSummariesForTab'
import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import i18n from '@/i18n/i18n'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Button } from '@/shared/ui/controls/Button.view'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { Group } from '@/shared/ui/controls/Group.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function ActiveFilterSummary({
  items,
  children,
}: {
  items: FilterSummaryItem[]
  children?: ReactNode
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const visibleItems = filterSummariesForTab(items, activeTab)
  const { slot: leading, content: afterLeading } = partitionSlot(
    children,
    ActiveFilterLeading,
  )
  const { slot: actions, content } = partitionSlot(
    afterLeading,
    ActiveFilterActions,
  )
  if (
    visibleItems.length === 0 &&
    leading.length === 0 &&
    content.length === 0 &&
    actions.length === 0
  )
    return null

  return (
    <div className="mb-4">
      <Group label={i18n.t('ui.filterbar.activeFilters')}>
        <Inline as="div" flow="wrap" align="center" gap="default">
          {leading}
          {visibleItems.map((item) => (
            <ActiveFilterChip key={item.key} item={item} />
          ))}
          {content}
          {actions}
        </Inline>
      </Group>
    </div>
  )
}

function ActiveFilterChip({ item }: { item: FilterSummaryItem }) {
  const { setFilters } = useDashboardFilters()
  return (
    <Layout as="span" flow="control">
      <Button
        type="button"
        onClick={() =>
          setFilters((current) => clearFilterGroup(current, item.key))
        }
        title={i18n.t('ui.filterbar.clearValue0Filter', { value0: item.key })}
        variant="filterTag"
      >
        <Text truncate>{item.label}</Text>
        <Decorative>×</Decorative>
      </Button>
    </Layout>
  )
}

function ActiveFilterLeading({ children }: { children: ReactNode }) {
  return children
}

function ActiveFilterActions({ children }: { children: ReactNode }) {
  return children
}

ActiveFilterSummary.Leading = ActiveFilterLeading

ActiveFilterSummary.Actions = ActiveFilterActions
