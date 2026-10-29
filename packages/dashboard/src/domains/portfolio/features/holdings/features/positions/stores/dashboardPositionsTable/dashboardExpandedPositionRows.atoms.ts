import type { ExpandedState } from '@tanstack/react-table'
import { atom } from 'jotai'

import { DEFAULT_EXPANDED_POSITION_ROWS } from './defaultExpandedPositionRows'

export const dashboardExpandedPositionRowsAtom = atom<ExpandedState>(
  DEFAULT_EXPANDED_POSITION_ROWS,
)
