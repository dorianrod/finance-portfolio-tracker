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
  sinceTrackingIrr: number | null
  trailingThreeYears: PerformanceContributionSummary
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
