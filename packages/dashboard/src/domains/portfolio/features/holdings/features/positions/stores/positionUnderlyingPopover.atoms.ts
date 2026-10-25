import { atom } from 'jotai'

import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'

const DEFAULT_POSITION_UNDERLYING_POPOVER: FundPositionPopoverTarget | null =
  null
export const positionUnderlyingPopoverAtom =
  atom<FundPositionPopoverTarget | null>(DEFAULT_POSITION_UNDERLYING_POPOVER)
