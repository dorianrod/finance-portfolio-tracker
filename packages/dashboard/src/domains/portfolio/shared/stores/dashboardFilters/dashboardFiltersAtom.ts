import { atom } from 'jotai'

import { resetFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/resetFilters'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export const dashboardFiltersAtom = atom<DashboardFilters>(resetFilters())
