import type {
  ContributionHorizon,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'

export function resolveContributionHorizon({
  horizon,
  sinceTracking,
  sinceTrackingIrr,
  trailingThreeYears,
  trailingThreeYearIrr,
}: {
  horizon: ContributionHorizon
  sinceTracking: PerformanceContributionSummary
  // Missing or insufficient cash flows may not define a since-tracking return.
  sinceTrackingIrr: number | null
  trailingThreeYears: PerformanceContributionSummary
  // The available cash flows may not define a full three-year return.
  trailingThreeYearIrr: number | null
}) {
  const threeYearUnavailable =
    !trailingThreeYears.available || trailingThreeYearIrr === null
  const activeHorizon =
    horizon === 'trailing-3y' && threeYearUnavailable
      ? 'since-tracking'
      : horizon
  return {
    activeHorizon,
    irr:
      activeHorizon === 'since-tracking'
        ? sinceTrackingIrr
        : trailingThreeYearIrr,
    summary:
      activeHorizon === 'since-tracking' ? sinceTracking : trailingThreeYears,
    threeYearUnavailable,
  }
}
