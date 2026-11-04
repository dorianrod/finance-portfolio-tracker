import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'

export function makeFundCoverageReport(
  overrides: Partial<FundCoverageReport> = {},
): FundCoverageReport {
  return {
    asOfDate: new Date('2026-10-18'),
    portfolioValue: 2_000,
    fundValue: 1_000,
    directIdentifiedValue: 100,
    opaqueValue: 900,
    decomposedValue: 900,
    highConfidenceExplainedValue: 900,
    undisclosedFundValue: 100,
    fundCoveragePct: 90,
    portfolioCoveragePct: 50,
    coverageGatePass: true,
    topFundsGatePass: true,
    exactProxyGatePass: true,
    repeatabilityGatePass: true,
    feasibilityStatus: 'passed',
    fundCount: 1,
    issueCount: 0,
    ...overrides,
  }
}
