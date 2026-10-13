import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

interface RawFundHolding {
  parent_isin: string
  parent_ticker: string
  parent_name: string
  holding_id: string
  holding_name: string
  issuer_id?: string
  issuer_name?: string
  weight: string
  source_tier?: string
  source_name?: string
  holdings_date?: string
}

interface RawFundHoldingStatus {
  parent_id: string
  parent_isin: string
  parent_ticker: string
  parent_name: string
  quality_tier: string
  validation_status: string
  source_name: string
  source_type: string
  source_url: string
  index_name: string
  replication_method: string
  proxy_name: string
  proxy_isin: string
  fetched_at: string
  holdings_date: string
  freshness_days: string
  is_stale: string
  holding_count: string
  raw_weight_sum: string
  explained_pct: string
  residual_pct: string
  market_value: string
  explained_value: string
  residual_value: string
  refresh_streak: string
  issues: string
}

interface RawFundCoverageReport {
  as_of_date: string
  portfolio_value: string
  fund_value: string
  direct_identified_value: string
  opaque_value: string
  decomposed_value: string
  high_confidence_explained_value: string
  undisclosed_fund_value: string
  fund_coverage_pct: string
  portfolio_coverage_pct: string
  coverage_gate_pass: string
  top_funds_gate_pass: string
  exact_proxy_gate_pass: string
  repeatability_gate_pass: string
  feasibility_status: string
  fund_count: string
  issue_count: string
}

export type FundQualityTier = 'A' | 'B' | 'C' | 'D'
export type FundValidationStatus = 'ok' | 'warning' | 'error'

export interface FundHolding {
  parentIsin: string
  parentTicker: string
  parentName: string
  holdingId: string
  holdingName: string
  issuerId: string
  issuerName: string
  weight: number
  sourceTier: FundQualityTier | ''
  sourceName: string
  holdingsDate: string
}

export interface FundHoldingStatus {
  parentId: string
  parentIsin: string
  parentTicker: string
  parentName: string
  qualityTier: FundQualityTier
  validationStatus: FundValidationStatus
  sourceName: string
  sourceType: string
  sourceUrl: string
  indexName: string
  replicationMethod: string
  proxyName: string
  proxyIsin: string
  fetchedAt: string
  holdingsDate: string
  freshnessDays: number
  isStale: boolean
  holdingCount: number
  rawWeightSum: number
  explainedPct: number
  residualPct: number
  marketValue: number
  explainedValue: number
  residualValue: number
  refreshStreak: number
  issues: string
}

export interface FundCoverageReport {
  asOfDate: string
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

export interface FundHoldingsData {
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  loading: boolean
}

const bool = (value: string | undefined) => value?.trim().toLowerCase() === 'true'
const num = (value: string | undefined) => Number.parseFloat(value || '0') || 0

export function useFundHoldingsData(): FundHoldingsData {
  const [data, setData] = useState<FundHoldingsData>({
    holdings: [], statuses: [], report: null, loading: true,
  })

  useEffect(() => {
    Promise.all([
      parseCsv<RawFundHolding>(dataUrl('fund_holdings.csv')).catch(() => []),
      parseCsv<RawFundHoldingStatus>(dataUrl('fund_holdings_status.csv')).catch(() => []),
      parseCsv<RawFundCoverageReport>(dataUrl('fund_holdings_coverage.csv')).catch(() => []),
    ]).then(([holdingRows, statusRows, reportRows]) => {
      const holdings = holdingRows
        .map((row): FundHolding => ({
          parentIsin: row.parent_isin?.trim() || '',
          parentTicker: row.parent_ticker?.trim() || '',
          parentName: row.parent_name?.trim() || '',
          holdingId: row.holding_id?.trim() || '',
          holdingName: row.holding_name?.trim() || '',
          issuerId: row.issuer_id?.trim() || row.holding_id?.trim() || '',
          issuerName: row.issuer_name?.trim() || row.holding_name?.trim() || '',
          weight: num(row.weight),
          sourceTier: (row.source_tier?.trim() || '') as FundQualityTier | '',
          sourceName: row.source_name?.trim() || '',
          holdingsDate: row.holdings_date?.trim() || '',
        }))
        .filter((row) => row.holdingId && row.holdingName && row.weight > 0)

      const statuses = statusRows.map((row): FundHoldingStatus => ({
        parentId: row.parent_id?.trim() || row.parent_isin?.trim() || row.parent_ticker?.trim() || '',
        parentIsin: row.parent_isin?.trim() || '',
        parentTicker: row.parent_ticker?.trim() || '',
        parentName: row.parent_name?.trim() || '',
        qualityTier: (row.quality_tier?.trim() || 'D') as FundQualityTier,
        validationStatus: (row.validation_status?.trim() || 'error') as FundValidationStatus,
        sourceName: row.source_name?.trim() || '',
        sourceType: row.source_type?.trim() || '',
        sourceUrl: row.source_url?.trim() || '',
        indexName: row.index_name?.trim() || '',
        replicationMethod: row.replication_method?.trim() || '',
        proxyName: row.proxy_name?.trim() || '',
        proxyIsin: row.proxy_isin?.trim() || '',
        fetchedAt: row.fetched_at?.trim() || '',
        holdingsDate: row.holdings_date?.trim() || '',
        freshnessDays: num(row.freshness_days),
        isStale: bool(row.is_stale),
        holdingCount: num(row.holding_count),
        rawWeightSum: num(row.raw_weight_sum),
        explainedPct: num(row.explained_pct),
        residualPct: num(row.residual_pct),
        marketValue: num(row.market_value),
        explainedValue: num(row.explained_value),
        residualValue: num(row.residual_value),
        refreshStreak: num(row.refresh_streak),
        issues: row.issues?.trim() || '',
      }))

      const rawReport = reportRows[0]
      const report = rawReport ? {
        asOfDate: rawReport.as_of_date,
        portfolioValue: num(rawReport.portfolio_value),
        fundValue: num(rawReport.fund_value),
        directIdentifiedValue: num(rawReport.direct_identified_value),
        opaqueValue: num(rawReport.opaque_value),
        decomposedValue: num(rawReport.decomposed_value),
        highConfidenceExplainedValue: num(rawReport.high_confidence_explained_value),
        undisclosedFundValue: num(rawReport.undisclosed_fund_value),
        fundCoveragePct: num(rawReport.fund_coverage_pct),
        portfolioCoveragePct: num(rawReport.portfolio_coverage_pct),
        coverageGatePass: bool(rawReport.coverage_gate_pass),
        topFundsGatePass: bool(rawReport.top_funds_gate_pass),
        exactProxyGatePass: bool(rawReport.exact_proxy_gate_pass),
        repeatabilityGatePass: bool(rawReport.repeatability_gate_pass),
        feasibilityStatus: rawReport.feasibility_status as FundCoverageReport['feasibilityStatus'],
        fundCount: num(rawReport.fund_count),
        issueCount: num(rawReport.issue_count),
      } : null

      setData({ holdings, statuses, report, loading: false })
    })
  }, [])

  return data
}

/** Compatibility helper for consumers that only need constituent rows. */
export function useFundHoldings(): FundHolding[] {
  return useFundHoldingsData().holdings
}
