import { atom } from 'jotai'

const DEFAULT_CONCENTRATION_TREND_HOVERED_INDEX = null

export const concentrationTrendHoveredIndexAtom = atom<number | null>(
  DEFAULT_CONCENTRATION_TREND_HOVERED_INDEX,
)
