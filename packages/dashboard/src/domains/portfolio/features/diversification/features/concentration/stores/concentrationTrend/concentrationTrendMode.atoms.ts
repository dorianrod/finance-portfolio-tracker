import { atom } from 'jotai'

import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'

const DEFAULT_CONCENTRATION_TREND_MODE: ConcentrationMode = 'held'

export const concentrationTrendModeAtom = atom<ConcentrationMode>(
  DEFAULT_CONCENTRATION_TREND_MODE,
)
