import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { dashboardFiltersAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardFilters.atoms'
import { useAccountFilterLabels } from '@/domains/portfolio/services/useAccountFilterLabels'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import type { FilterScopeSpec } from '@/domains/portfolio/types/filterScope'
import { buildFilterScopeBadges, type ScopeBadge } from './helpers/presenters/buildFilterScopeBadges'

export type { AccountScopeMode, FilterScopeSpec, PeriodScopeMode } from '@/domains/portfolio/types/filterScope'

const TONE_CLASSES = {
  applied: 'border-blue-700/70 bg-blue-900/60 text-blue-300',
  default: 'border-gray-700 bg-gray-950/45 text-gray-500',
  ignored: 'border-amber-700/60 bg-amber-950/35 text-amber-300',
} as const

function FilterScopeBadge({ badge }: { badge: ScopeBadge }) {
  return <span title={badge.detail} className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal ${TONE_CLASSES[badge.tone]}`}>{badge.label}</span>
}

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
    <span className="mt-1.5 flex flex-wrap gap-1.5" aria-label={i18n.t('ui.filterscopebadges.indicatorFilterScope')}>
      {badges.map((badge) => <FilterScopeBadge key={badge.label} badge={badge} />)}
    </span>
  )
}
