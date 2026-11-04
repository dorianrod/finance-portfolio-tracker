import { atom } from 'jotai'

const DEFAULT_DISCLOSURE_INPUT = null

export const disclosureInputAtom = atom<DisclosureInput | null>(
  DEFAULT_DISCLOSURE_INPUT,
)

type DisclosureInput = { id: string; expanded: boolean }
