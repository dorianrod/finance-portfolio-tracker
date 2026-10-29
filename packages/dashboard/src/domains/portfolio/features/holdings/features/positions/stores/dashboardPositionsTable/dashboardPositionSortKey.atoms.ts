import { atom } from 'jotai'

import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'

export const dashboardPositionSortKeyAtom = atom<PositionSortKey>('total_value')
