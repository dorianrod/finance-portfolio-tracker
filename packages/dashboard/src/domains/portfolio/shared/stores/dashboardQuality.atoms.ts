import { atom } from 'jotai'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/quality'

export const dashboardSelectedQualityThemeAtom = atom<QualityThemeId | null>(null)
