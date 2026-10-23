import { atom } from 'jotai'
import { resetFilters } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'
import type { Filters } from '@/domains/portfolio/shared/types/filters'

export const dashboardFiltersAtom = atom<Filters>(resetFilters())
export const dashboardFiltersOpenAtom = atom<boolean>(false)
