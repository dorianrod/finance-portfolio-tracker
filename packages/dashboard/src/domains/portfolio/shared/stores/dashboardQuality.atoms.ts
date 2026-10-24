import { atom } from 'jotai'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'

export const dashboardSelectedQualityThemeAtom = atom<QualityThemeId | null>(null)
