import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { FilterScopeContext } from '@/domains/portfolio/shared/types/filterScopeContext.type'
import i18n from '@/i18n/i18n'
import { InlineGroup } from '@/shared/ui/controls/InlineGroup.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { FilterScopeBadge } from './FilterScopeBadges.view'
import { useFilterScopeBadges } from './helpers/presenters/useFilterScopeBadges'

export function FilterScopePresentation({
  scope,
  scopeContext,
}: {
  scope: FilterScopeSpec
  scopeContext: FilterScopeContext
}) {
  const badges = useFilterScopeBadges({ ...scope, ...scopeContext })
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
