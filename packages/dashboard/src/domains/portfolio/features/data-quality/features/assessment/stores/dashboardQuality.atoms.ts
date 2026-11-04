import { atom } from 'jotai'

import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'

export const dashboardSelectedQualityThemeAtom = atom<QualityThemeId | null>(
  null,
)
