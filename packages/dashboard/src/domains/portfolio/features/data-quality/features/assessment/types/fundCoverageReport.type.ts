export type FundCoverageReport = {
  asOfDate: Date
  portfolioValue: number
  fundValue: number
  directIdentifiedValue: number
  opaqueValue: number
  decomposedValue: number
  highConfidenceExplainedValue: number
  undisclosedFundValue: number
  fundCoveragePct: number
  portfolioCoveragePct: number
  coverageGatePass: boolean
  topFundsGatePass: boolean
  exactProxyGatePass: boolean
  repeatabilityGatePass: boolean
  feasibilityStatus: 'passed' | 'pending_repeatability' | 'limited'
  fundCount: number
  issueCount: number
}
