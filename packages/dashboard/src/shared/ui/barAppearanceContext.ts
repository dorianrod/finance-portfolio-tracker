import { createContext } from 'react'

import type { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import type { BAR_CORNERS } from '@/shared/ui/chartAppearance/barCorners'
import type { BAR_PROMINENCE } from '@/shared/ui/chartAppearance/barProminence'

export type BarAppearance = {
  tone?: keyof typeof CHART_COLORS
  corners?: keyof typeof BAR_CORNERS
  prominence?: keyof typeof BAR_PROMINENCE
}

export const BarAppearanceContext = createContext<BarAppearance | undefined>(
  undefined,
)
