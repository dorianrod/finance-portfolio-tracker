import { atom } from 'jotai'

import { DEFAULT_DASHBOARD_FILTERS } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/defaultDashboardFilters'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export const dashboardFiltersAtom = atom<DashboardFilters>(
  DEFAULT_DASHBOARD_FILTERS,
)
