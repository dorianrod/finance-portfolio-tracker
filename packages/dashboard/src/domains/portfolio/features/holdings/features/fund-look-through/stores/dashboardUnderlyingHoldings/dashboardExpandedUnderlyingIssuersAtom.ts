import { atom } from 'jotai'

import { DEFAULT_EXPANDED_UNDERLYING_ISSUERS } from './defaultExpandedUnderlyingIssuers'

export const dashboardExpandedUnderlyingIssuersAtom = atom<Set<string>>(
  DEFAULT_EXPANDED_UNDERLYING_ISSUERS,
)
