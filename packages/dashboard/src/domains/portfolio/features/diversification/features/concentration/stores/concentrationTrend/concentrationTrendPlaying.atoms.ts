import { atom } from 'jotai'

const DEFAULT_CONCENTRATION_TREND_PLAYING = false

export const concentrationTrendPlayingAtom = atom<boolean>(
  DEFAULT_CONCENTRATION_TREND_PLAYING,
)
