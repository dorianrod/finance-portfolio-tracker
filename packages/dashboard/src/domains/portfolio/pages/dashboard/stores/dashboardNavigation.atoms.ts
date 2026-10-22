import { atom } from 'jotai'
import type { HoldingsView } from '@/domains/portfolio/components/holdings/HoldingsViewTabs.feature'

export type AnalysisTab =
  | 'overview'
  | 'wealth'
  | 'performance'
  | 'allocation'
  | 'holdings'
  | 'quality'

export const dashboardActiveTabAtom = atom<AnalysisTab>('overview')
export const dashboardHoldingsViewAtom = atom<HoldingsView>('positions')
