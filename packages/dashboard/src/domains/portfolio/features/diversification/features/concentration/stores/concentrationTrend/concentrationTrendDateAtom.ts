import { atom } from 'jotai'

const DEFAULT_CONCENTRATION_TREND_DATE = null

export const concentrationTrendDateAtom = atom<Date | null>(
  DEFAULT_CONCENTRATION_TREND_DATE,
)
