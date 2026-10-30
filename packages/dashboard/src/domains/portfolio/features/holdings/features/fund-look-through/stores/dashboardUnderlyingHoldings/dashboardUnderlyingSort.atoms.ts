import { atom } from 'jotai'

import type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/fundExposureSort.type'

export const dashboardUnderlyingSortAtom = atom<FundExposureSort>('value')
