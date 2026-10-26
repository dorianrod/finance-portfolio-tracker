import { createContext } from 'react'

import type { CHART_COLORS } from '@/shared/theme/chartColors'

import type { BAR_CORNERS, BAR_PROMINENCE } from './chartAppearance'

export type BarAppearance = {
  tone?: keyof typeof CHART_COLORS
  corners?: keyof typeof BAR_CORNERS
  prominence?: keyof typeof BAR_PROMINENCE
}

export const BarAppearanceContext = createContext<BarAppearance | undefined>(
  undefined,
)
