import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'

import { FilterScopePresentation } from './FilterScopePresentation.view'

export function FilterScopeBadges(scope: FilterScopeSpec) {
  const scopeContext = useFilterScopeContext()
  return <FilterScopePresentation scope={scope} scopeContext={scopeContext} />
}

export type {
  AccountScopeMode,
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/types/filterScope.type'
