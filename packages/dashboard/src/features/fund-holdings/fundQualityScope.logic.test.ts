import { describe, expect, it } from 'vitest'
import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { computeFundExposurePercentages, scopeFundQualityData } from './fundQualityScope.logic'

function position(overrides: Partial<PositionRow>): PositionRow {
  return {
    kind: 'position', id: 'position', name: 'Asset', ticker: '', isin: '', account: 'account',
    status: 'active', operationTypes: new Set(), quantity: 1, last_price: 1,
    total_value: 0, unrealized_gain: 0, unrealized_gain_net: 0,
    unrealized_gain_pct: 0, realized_gain: 0, realized_gain_net: 0,
    tax_rate: 0, total_dividends: 0, total_dividends_net: 0,
    total_interest: 0, total_interest_net: 0, total_realized_return: 0,
    total_invested: 0, total_return_pct: 0, xirr: null,
    xirr_rolling_3y: null, xirr_rolling_period_years: null, subRows: [],
    ...overrides,
  }
}

function status(overrides: Partial<FundHoldingStatus>): FundHoldingStatus {
  return {
    parentId: 'FUND', parentIsin: 'FUND', parentTicker: '', parentName: 'World ETF',
    qualityTier: 'A', validationStatus: 'ok', sourceName: 'Official', sourceType: 'official',
    sourceUrl: '', indexName: '', replicationMethod: '', proxyName: '', proxyIsin: '',
    fetchedAt: '', holdingsDate: '', freshnessDays: 1, isStale: false, holdingCount: 10,
    rawWeightSum: 1, explainedPct: 90, residualPct: 10, marketValue: 1_000,
    explainedValue: 900, residualValue: 100, refreshStreak: 2, issues: '',
    decompositionState: 'partial', snapshotId: 'snapshot', sourceOrigin: 'deterministic',
    manualAttention: false, checksumSha256: '',
    ...overrides,
  }
}

const report: FundCoverageReport = {
  asOfDate: '2026-10-18', portfolioValue: 2_000, fundValue: 1_000,
  directIdentifiedValue: 100, opaqueValue: 900, decomposedValue: 900,
  highConfidenceExplainedValue: 900, undisclosedFundValue: 100,
  fundCoveragePct: 90, portfolioCoveragePct: 50, coverageGatePass: true,
  topFundsGatePass: true, exactProxyGatePass: true, repeatabilityGatePass: true,
  feasibilityStatus: 'passed', fundCount: 1, issueCount: 0,
}

describe('scopeFundQualityData', () => {
  it('uses the whole selected portfolio for the shared identified percentage', () => {
    expect(computeFundExposurePercentages(575, 425, 59)).toEqual({
      identified: 54.3,
      unresolved: 40.1,
      notApplicable: 5.6,
    })
  })

  it('recalculates look-through values from the selected account positions', () => {
    const selected = [
      position({ id: 'fund', account: 'selected', isin: 'FUND', name: 'World ETF', total_value: 200 }),
      position({ id: 'direct', account: 'selected', isin: 'DIRECT', name: 'Direct share', total_value: 100 }),
    ]
    const result = scopeFundQualityData(selected, [], [status({})], [], [], report)

    expect(result.report).toMatchObject({
      portfolioValue: 300,
      fundValue: 200,
      directIdentifiedValue: 100,
      decomposedValue: 180,
      highConfidenceExplainedValue: 180,
      undisclosedFundValue: 20,
    })
    expect(result.notApplicableValue).toBe(0)
    expect(result.statuses[0]).toMatchObject({ marketValue: 200, explainedValue: 180, residualValue: 20 })
  })

  it('matches identifier-less funds by name and scopes their related diagnostics', () => {
    const selectedStatus = status({
      parentId: 'Employee fund', parentIsin: '', parentName: 'Employee fund',
      qualityTier: 'D', validationStatus: 'error', explainedPct: 0, residualPct: 100,
    })
    const holding = { parentIsin: '', parentTicker: '', parentName: 'Employee fund' } as FundHolding
    const snapshot = { fundId: 'Employee fund' } as FundSnapshot
    const unresolved = { parentId: 'Employee fund' } as FundUnresolved
    const result = scopeFundQualityData(
      [position({ name: 'Employee fund', total_value: 500 })],
      [holding],
      [selectedStatus, status({ parentId: 'OTHER', parentIsin: 'OTHER' })],
      [snapshot],
      [unresolved],
      report,
    )

    expect(result.statuses).toHaveLength(1)
    expect(result.holdings).toEqual([holding])
    expect(result.snapshots).toEqual([snapshot])
    expect(result.unresolved).toEqual([unresolved])
    expect(result.report).toMatchObject({ portfolioValue: 500, fundValue: 500, undisclosedFundValue: 500, issueCount: 1 })
  })

  it('reports a direct-only account as fully identified', () => {
    const result = scopeFundQualityData(
      [position({ isin: 'DIRECT', name: 'Direct share', total_value: 250 })],
      [], [], [], [], report,
    )

    expect(result.report).toMatchObject({
      portfolioValue: 250,
      fundValue: 0,
      directIdentifiedValue: 250,
      opaqueValue: 0,
      undisclosedFundValue: 0,
      portfolioCoveragePct: 100,
      feasibilityStatus: 'passed',
    })
  })

  it('isolates savings and checking accounts from look-through coverage', () => {
    const result = scopeFundQualityData(
      [
        position({ id: 'fund', account_category: 'brokerage', isin: 'FUND', name: 'World ETF', total_value: 200 }),
        position({ id: 'savings', account_category: 'savings', name: 'Livret A', total_value: 1_000 }),
        position({ id: 'checking', account_category: 'checking', name: 'Compte courant', total_value: 500 }),
        position({ id: 'cash', account_type: 'Bourse – Cash', account_category: 'brokerage', name: 'Cash CTO', total_value: 900 }),
      ],
      [],
      [status({})],
      [],
      [],
      report,
    )

    expect(result.report).toMatchObject({
      portfolioValue: 200,
      fundValue: 200,
      opaqueValue: 0,
      decomposedValue: 180,
      undisclosedFundValue: 20,
    })
    expect(result.notApplicableValue).toBe(2_400)
  })

  it('returns an empty look-through scope when only cash accounts are selected', () => {
    const result = scopeFundQualityData(
      [
        position({ id: 'savings', account_category: 'savings', name: 'Livret A', total_value: 1_000 }),
        position({ id: 'checking', account_category: 'checking', name: 'Compte courant', total_value: 500 }),
      ],
      [],
      [status({ parentId: 'Livret A', parentIsin: '', parentName: 'Livret A' })],
      [],
      [],
      report,
    )

    expect(result.statuses).toEqual([])
    expect(result.notApplicableValue).toBe(1_500)
    expect(result.report).toMatchObject({
      portfolioValue: 0,
      fundValue: 0,
      directIdentifiedValue: 0,
      opaqueValue: 0,
      undisclosedFundValue: 0,
      issueCount: 0,
    })
  })
})
