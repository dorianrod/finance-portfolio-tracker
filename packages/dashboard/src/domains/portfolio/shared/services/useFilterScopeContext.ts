import { useAtomValue } from 'jotai'

import { useAccountFilterLabels } from '@/domains/portfolio/shared/services/useAccountFilterLabels'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import type { FilterScopeContext } from '@/domains/portfolio/shared/types/filterScopeContext.type'

/*
 * @architecture-decision direct-filter-scope-inputs
 * @rules arch-no-prop-drilling, arch-no-visual-logic-below-page
 * @choice Consumers read raw filter inputs here and compose the filter-scope presentation view directly.
 * @reason Metric owners select their reporting scope; reusable services supply data while the filter view owns badge text and tones.
 * @alternative A tooltip feature forwarding derived scope adds no business responsibility and needs avoidable ignores.
 * @revisit Filter-scope selection acquires a distinct business workflow beyond these read-only inputs.
 */
export function useFilterScopeContext(): FilterScopeContext {
  const filters = useAtomValue(dashboardFiltersAtom)
  const accountLabels = useAccountFilterLabels()
  return { filters, accountLabels }
}
