import { atom } from 'jotai'

import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'

const DEFAULT_POSITION_SAVINGS_PREVIEW = null

export const positionSavingsPreviewAtom = atom<SavingsChartTarget | null>(
  DEFAULT_POSITION_SAVINGS_PREVIEW,
)
