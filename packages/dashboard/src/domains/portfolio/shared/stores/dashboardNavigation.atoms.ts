import { atom } from 'jotai'

import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'

export type AnalysisTab =
  | 'overview'
  | 'wealth'
  | 'performance'
  | 'diversification'
  | 'holdings'
  | 'quality'

export const dashboardActiveTabAtom = atom<AnalysisTab>('overview')
export const dashboardHoldingsViewAtom = atom<HoldingsView>('positions')
