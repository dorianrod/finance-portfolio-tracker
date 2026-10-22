import { atom } from 'jotai'
import type { ExpandedState } from '@tanstack/react-table'
import type { SortKey } from '@/domains/portfolio/types/filters'

export const dashboardExpandedPositionRowsAtom = atom<ExpandedState>({})
export const dashboardPositionSortKeyAtom = atom<SortKey>('total_value')
export const dashboardPositionSortDirectionAtom = atom<'asc' | 'desc'>('desc')
