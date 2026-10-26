import { atom } from 'jotai'

export const dashboardExpandedUnderlyingIssuersAtom = atom<Set<string>>(
  new Set<string>(),
)
