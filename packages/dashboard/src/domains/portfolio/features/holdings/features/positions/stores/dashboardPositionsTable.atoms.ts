import type { ExpandedState } from '@tanstack/react-table'
import { atom } from 'jotai'

import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'

export const dashboardExpandedPositionRowsAtom = atom<ExpandedState>({})
export const dashboardPositionSortKeyAtom = atom<PositionSortKey>('total_value')
export const dashboardPositionSortDirectionAtom = atom<'asc' | 'desc'>('desc')
