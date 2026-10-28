import { useAtomValue } from 'jotai'

import { useAccountFilterLabels } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/useAccountFilterLabels'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersAtom'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import i18n from '@/i18n/i18n'
import { InlineGroup } from '@/shared/ui/controls/InlineGroup.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { FilterScopeBadge } from './FilterScopeBadges.view'
import { useFilterScopeBadges } from './helpers/presenters/useFilterScopeBadges'

export function FilterScopeBadges({
  account,
  period,
  effectiveDate,
}: FilterScopeSpec) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const accountLabels = useAccountFilterLabels()
  const badges = useFilterScopeBadges({
    account,
    accountLabels,
    effectiveDate,
    filters,
    period,
  })
  return (
    <Layout as="span" flow="inline" spaceBefore="default">
      <InlineGroup label={i18n.t('ui.filterscopebadges.indicatorFilterScope')}>
        <Inline as="span" flow="wrap" gap="compact">
          {badges.map((badge) => (
            <FilterScopeBadge key={badge.label} badge={badge} />
          ))}
        </Inline>
      </InlineGroup>
    </Layout>
  )
}

export type {
  AccountScopeMode,
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/types/filterScope.type'
