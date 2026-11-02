import { atom } from 'jotai'

import type { DiversificationView } from '@/domains/portfolio/features/diversification/shared/types/diversificationView.type'

export const dashboardDiversificationViewAtom =
  atom<DiversificationView>('current')
