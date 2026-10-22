import type { AssetIrrSummary } from '@/domains/portfolio/apis/queries/useAssetIrr'
import type {
  ContributionHorizon,
  PerformanceContributionSummary,
} from '@/domains/portfolio/components/portfolio-charts/performanceContribution.logic'

const MINIMUM_DISPLAYED_IRR = 0.005
const RANKING_SIZE = 5

export function buildAssetIrrRankings(summary: AssetIrrSummary) {
  const measured = summary.assets.filter(
    (item) => Math.abs(item.irr) >= MINIMUM_DISPLAYED_IRR,
  )
  return {
    measuredCount: measured.length,
    topReturns: measured
      .filter((item) => item.irr > 0)
      .toSorted((left, right) => right.irr - left.irr)
      .slice(0, RANKING_SIZE),
    underperformers: measured
      .filter((item) => item.irr < 0)
      .toSorted((left, right) => left.irr - right.irr)
      .slice(0, RANKING_SIZE),
  }
}

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
  const threeYearUnavailable = !trailingThreeYears.available || trailingThreeYearIrr === null
  const activeHorizon = horizon === 'trailing-3y' && threeYearUnavailable
    ? 'since-tracking'
    : horizon
  return {
    activeHorizon,
    irr: activeHorizon === 'since-tracking' ? sinceTrackingIrr : trailingThreeYearIrr,
    summary: activeHorizon === 'since-tracking' ? sinceTracking : trailingThreeYears,
    threeYearUnavailable,
  }
}
