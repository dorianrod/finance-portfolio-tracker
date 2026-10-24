import { useAccountFilterLabels } from '@/domains/portfolio/shared/services/useAccountFilterLabels'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useAtomValue } from 'jotai'
import { FilterScopeBadge } from './FilterScopeBadges.view'
import { buildFilterScopeBadges } from './helpers/presenters/buildFilterScopeBadges'

export type {
  AccountScopeMode,
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/types/filterScope.type'

export function FilterScopeBadges({ account, period, effectiveDate }: FilterScopeSpec) {
  const formatDate = useFormatDate()
  const filters = useAtomValue(dashboardFiltersAtom)
  const accountLabels = useAccountFilterLabels()
  const badges = buildFilterScopeBadges({
    account,
    accountLabels,
    effectiveDate,
    filters,
    formatDate,
    period,
  })
  return (
    <span
      className="mt-1.5 flex flex-wrap gap-1.5"
      aria-label={i18n.t('ui.filterscopebadges.indicatorFilterScope')}
    >
      {badges.map((badge) => (
        <FilterScopeBadge key={badge.label} badge={badge} />
      ))}
    </span>
  )
}
