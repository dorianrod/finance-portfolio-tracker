import { atom } from 'jotai'

const DEFAULT_NAVIGATION_ID = ''

export const navigationIdAtom = atom<string>(DEFAULT_NAVIGATION_ID)
