import { atom } from 'jotai'
import { resetFilters } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'
import type { Filters } from '@/domains/portfolio/types/filters'

export const dashboardFiltersAtom = atom<Filters>(resetFilters())
export const dashboardFiltersOpenAtom = atom<boolean>(false)
