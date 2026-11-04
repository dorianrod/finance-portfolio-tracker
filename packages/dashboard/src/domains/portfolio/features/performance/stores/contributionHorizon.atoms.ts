import { atom } from 'jotai'

import type { ContributionHorizon } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'

const DEFAULT_CONTRIBUTION_HORIZON: ContributionHorizon = 'since-tracking'

export const contributionHorizonAtom = atom<ContributionHorizon>(
  DEFAULT_CONTRIBUTION_HORIZON,
)
