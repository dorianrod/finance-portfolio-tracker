import { atom } from 'jotai'

const DEFAULT_TOOLTIP_INPUT = null

export const tooltipInputAtom = atom<TooltipInput | null>(DEFAULT_TOOLTIP_INPUT)

type TooltipInput = {
  portalContainer: HTMLDivElement | null
  setOpen: (open: boolean) => void
}
