import { atom } from 'jotai'

import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'

export const dashboardHoldingsViewAtom = atom<HoldingsView>('positions')
