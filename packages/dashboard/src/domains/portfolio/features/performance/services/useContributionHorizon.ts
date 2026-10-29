import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { resolveContributionHorizon } from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel/resolveContributionHorizon'
import { contributionHorizonAtom } from '@/domains/portfolio/features/performance/stores/contributionHorizon.atoms'

export function useContributionHorizon({
  sinceTracking,
  sinceTrackingIrr,
  trailingThreeYears,
  trailingThreeYearIrr,
}: Omit<Parameters<typeof resolveContributionHorizon>[0], 'horizon'>) {
  const [horizon, setHorizon] = useAtom(contributionHorizonAtom)
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
      setHorizon,
    ],
  )
}
