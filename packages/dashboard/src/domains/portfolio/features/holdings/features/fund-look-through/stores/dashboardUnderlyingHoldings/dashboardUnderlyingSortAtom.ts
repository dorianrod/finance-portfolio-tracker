import { atom } from 'jotai'

import type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'

export const dashboardUnderlyingSortAtom = atom<FundExposureSort>('value')
