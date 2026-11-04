import { atom } from 'jotai'

import type { PopoverState } from '@/shared/ui/usePopoverState'

const DEFAULT_POPOVER_INPUT = null

export const popoverInputAtom = atom<PopoverState | null>(DEFAULT_POPOVER_INPUT)
