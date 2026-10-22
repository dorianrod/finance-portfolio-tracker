import { atom } from 'jotai'
import type { QualityThemeId } from '@/domains/portfolio/types/quality'

export const dashboardSelectedQualityThemeAtom = atom<QualityThemeId | null>(null)
