import { atom } from 'jotai'

import type { AnalysisTab } from './dashboardNavigation.types'

export const dashboardActiveTabAtom = atom<AnalysisTab>('overview')
