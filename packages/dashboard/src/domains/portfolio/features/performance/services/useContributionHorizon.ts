import { useMemo, useState } from 'react'

import type { ContributionHorizon } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { resolveContributionHorizon } from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel/resolveContributionHorizon'

export function useContributionHorizon({
  sinceTracking,
  sinceTrackingIrr,
  trailingThreeYears,
  trailingThreeYearIrr,
}: Omit<Parameters<typeof resolveContributionHorizon>[0], 'horizon'>) {
  const [horizon, setHorizon] = useState<ContributionHorizon>('since-tracking')
  return useMemo(
    () => ({
      ...resolveContributionHorizon({
        horizon,
        sinceTracking,
        sinceTrackingIrr,
        trailingThreeYears,
        trailingThreeYearIrr,
      }),
      setHorizon,
    }),
    [
      horizon,
      sinceTracking,
      sinceTrackingIrr,
      trailingThreeYears,
      trailingThreeYearIrr,
    ],
  )
}
