import { atom } from 'jotai'
import { resetFilters } from '@/domains/portfolio/components/filters/filterBar.logic'
import type { Filters } from '@/domains/portfolio/types/filters'

export const dashboardFiltersAtom = atom<Filters>(resetFilters())
export const dashboardFiltersOpenAtom = atom<boolean>(false)
