import { describe, expect, it } from 'vitest'

import { makeFundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundCoverageReport.mock'

import { computeLookThroughMetrics } from './computeLookThroughMetrics'

describe('computeLookThroughMetrics', () => {
  it('uses selected exposure for confidence and coverage without changing the report', () => {
    const report = Object.freeze(
      makeFundCoverageReport({
        portfolioValue: 9999,
        directIdentifiedValue: 100,
        decomposedValue: 300,
        highConfidenceExplainedValue: 100,
        undisclosedFundValue: 100,
        opaqueValue: 100,
      }),
    )

    expect(computeLookThroughMetrics(report, 400)).toEqual({
      identifiedValue: 400,
      unresolvedValue: 200,
      selectedPortfolioValue: 1000,
      reliableValue: 200,
      otherSourceValue: 200,
      notApplicableValue: 400,
      identifiedPercentage: 40,
      unresolvedPercentage: 20,
      notApplicablePercentage: 40,
      hasNotApplicable: true,
      hasUnresolvedGap: true,
      reliablePercentage: 20,
      otherSourcePercentage: 20,
      directPercentage: 10,
      decomposedPercentage: 30,
      undisclosedPercentage: 10,
      opaquePercentage: 10,
    })
    expect(report.portfolioValue).toBe(9999)
  })

  it('caps confidence at identified value rather than producing negative other-source exposure', () => {
    const result = computeLookThroughMetrics(
      makeFundCoverageReport({ highConfidenceExplainedValue: 2000 }),
      0,
    )
    expect(result.reliableValue).toBe(1000)
    expect(result.otherSourceValue).toBe(0)
  })

  it('keeps percentages finite without any applicable exposure', () => {
    const result = computeLookThroughMetrics(
      makeFundCoverageReport({
        directIdentifiedValue: 0,
        decomposedValue: 0,
        highConfidenceExplainedValue: 0,
        undisclosedFundValue: 0,
        opaqueValue: 0,
      }),
      0,
    )
    expect(result.selectedPortfolioValue).toBe(0)
    expect(result.identifiedPercentage).toBe(0)
    expect(result.reliablePercentage).toBe(0)
    expect(result.undisclosedPercentage).toBe(0)
    expect(result.opaquePercentage).toBe(0)
    expect(result.hasUnresolvedGap).toBe(false)
  })

  it('preserves fully not-applicable exposure without reporting a gap', () => {
    const result = computeLookThroughMetrics(
      makeFundCoverageReport({
        directIdentifiedValue: 0,
        decomposedValue: 0,
        highConfidenceExplainedValue: 0,
        undisclosedFundValue: 0,
        opaqueValue: 0,
      }),
      500,
    )
    expect(result.selectedPortfolioValue).toBe(500)
    expect(result.notApplicablePercentage).toBe(100)
    expect(result.hasNotApplicable).toBe(true)
    expect(result.hasUnresolvedGap).toBe(false)
  })
})
