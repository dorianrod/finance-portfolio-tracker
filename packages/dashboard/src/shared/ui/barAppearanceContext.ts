import { createContext } from 'react'

import type { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import type { BAR_CORNERS, BAR_PROMINENCE } from './chartAppearance'

export type BarAppearance = {
  tone?: keyof typeof SEMANTIC_COLORS
  corners?: keyof typeof BAR_CORNERS
  prominence?: keyof typeof BAR_PROMINENCE
}

export const BarAppearanceContext = createContext<BarAppearance | undefined>(
  undefined,
)
