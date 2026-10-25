import { atom } from 'jotai'

import { resetFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export const dashboardFiltersAtom = atom<DashboardFilters>(resetFilters())
export const dashboardFiltersOpenAtom = atom<boolean>(false)
