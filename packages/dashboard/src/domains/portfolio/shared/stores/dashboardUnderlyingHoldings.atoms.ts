import { atom } from 'jotai'
import type { FundExposureSort } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'

export const dashboardUnderlyingQueryAtom = atom<string>('')
export const dashboardUnderlyingSortAtom = atom<FundExposureSort>('value')
export const dashboardExpandedUnderlyingIssuersAtom = atom<Set<string>>(new Set<string>())
