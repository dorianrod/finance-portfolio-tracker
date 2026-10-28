import { atom } from 'jotai'

// Scope selection renders the panel; overview controls can also open it.
export const dashboardFiltersOpenAtom = atom<boolean>(false)
