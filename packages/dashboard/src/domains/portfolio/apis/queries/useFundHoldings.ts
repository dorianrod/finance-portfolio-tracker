import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import * as yup from 'yup'

interface RawFundHolding {
  parent_isin: string
  parent_ticker: string
  parent_name: string
  holding_id: string
  holding_name: string
  issuer_id?: string
  issuer_name?: string
  weight: string
  source_tier?: FundQualityTier | ''
  source_name?: string
  holdings_date?: string
  holding_kind?: string
  lookthrough_path?: string
  depth?: string
  snapshot_id?: string
  source_origin?: string
  source_url?: string
}

interface RawFundHoldingHistory extends RawFundHolding {
  effective_date: string
  history_snapshot_id: string
  captured_at: string
}

interface RawFundHoldingStatus {
  parent_id: string
  parent_isin: string
  parent_ticker: string
  parent_name: string
  quality_tier: FundQualityTier | ''
  validation_status: FundValidationStatus | ''
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
  decomposition_state?: FundHoldingStatus['decompositionState'] | ''
  snapshot_id?: string
  source_origin?: string
  manual_attention?: string
  checksum_sha256?: string
}

interface RawFundSnapshot {
  fund_id: string
  fund_name: string
  snapshot_id: string
  snapshot_date: string
  as_of_date: string
  generated_at: string
  origin: string
  status: string
  is_active: string
  is_stale: string
  age_days: string
  holding_count: string
  weight_sum: string
  coverage_pct: string
  complete: string
  source_urls: string
  evidence_path: string
  holdings_path: string
  checksum_sha256: string
  notes: string
  validation_errors: string
}

interface RawFundUnresolved {
  parent_id: string
  parent_name: string
  unresolved_id: string
  unresolved_name: string
  reason: string
  path: string
  weight: string
  market_value: string
  queued_for_research: string
  detected_at: string
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
  feasibility_status: FundCoverageReport['feasibilityStatus']
  fund_count: string
  issue_count: string
}

export type FundQualityTier = 'A' | 'B' | 'C' | 'D'
export type FundValidationStatus = 'ok' | 'warning' | 'error'

const requiredText = () => yup.string().defined()
const optionalText = () => yup.string().optional()

const RAW_FUND_HOLDING_SCHEMA: yup.ObjectSchema<RawFundHolding> = yup.object({
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  holding_id: requiredText(),
  holding_name: requiredText(),
  issuer_id: optionalText(),
  issuer_name: optionalText(),
  weight: requiredText(),
  source_tier: yup.string<FundQualityTier | ''>().oneOf(['A', 'B', 'C', 'D', '']).optional(),
  source_name: optionalText(),
  holdings_date: optionalText(),
  holding_kind: optionalText(),
  lookthrough_path: optionalText(),
  depth: optionalText(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  source_url: optionalText(),
})

const RAW_FUND_HOLDING_HISTORY_SCHEMA: yup.ObjectSchema<RawFundHoldingHistory> = RAW_FUND_HOLDING_SCHEMA.shape({
  effective_date: requiredText(),
  history_snapshot_id: requiredText(),
  captured_at: requiredText(),
})

const RAW_FUND_HOLDING_STATUS_SCHEMA: yup.ObjectSchema<RawFundHoldingStatus> = yup.object({
  parent_id: requiredText(),
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  quality_tier: yup.string<FundQualityTier | ''>().oneOf(['A', 'B', 'C', 'D', '']).defined(),
  validation_status: yup.string<FundValidationStatus | ''>().oneOf(['ok', 'warning', 'error', '']).defined(),
  source_name: requiredText(),
  source_type: requiredText(),
  source_url: requiredText(),
  index_name: requiredText(),
  replication_method: requiredText(),
  proxy_name: requiredText(),
  proxy_isin: requiredText(),
  fetched_at: requiredText(),
  holdings_date: requiredText(),
  freshness_days: requiredText(),
  is_stale: requiredText(),
  holding_count: requiredText(),
  raw_weight_sum: requiredText(),
  explained_pct: requiredText(),
  residual_pct: requiredText(),
  market_value: requiredText(),
  explained_value: requiredText(),
  residual_value: requiredText(),
  refresh_streak: requiredText(),
  issues: requiredText(),
  decomposition_state: yup
    .string<FundHoldingStatus['decompositionState'] | ''>()
    .oneOf(['resolved', 'partial', 'unresolved', 'stale', ''])
    .optional(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  manual_attention: optionalText(),
  checksum_sha256: optionalText(),
})

const RAW_FUND_SNAPSHOT_SCHEMA: yup.ObjectSchema<RawFundSnapshot> = yup.object({
  fund_id: requiredText(),
  fund_name: requiredText(),
  snapshot_id: requiredText(),
  snapshot_date: requiredText(),
  as_of_date: requiredText(),
  generated_at: requiredText(),
  origin: requiredText(),
  status: requiredText(),
  is_active: requiredText(),
  is_stale: requiredText(),
  age_days: requiredText(),
  holding_count: requiredText(),
  weight_sum: requiredText(),
  coverage_pct: requiredText(),
  complete: requiredText(),
  source_urls: requiredText(),
  evidence_path: requiredText(),
  holdings_path: requiredText(),
  checksum_sha256: requiredText(),
  notes: requiredText(),
  validation_errors: requiredText(),
})

const RAW_FUND_UNRESOLVED_SCHEMA: yup.ObjectSchema<RawFundUnresolved> = yup.object({
  parent_id: requiredText(),
  parent_name: requiredText(),
  unresolved_id: requiredText(),
  unresolved_name: requiredText(),
  reason: requiredText(),
  path: requiredText(),
  weight: requiredText(),
  market_value: requiredText(),
  queued_for_research: requiredText(),
  detected_at: requiredText(),
})

const RAW_FUND_COVERAGE_REPORT_SCHEMA: yup.ObjectSchema<RawFundCoverageReport> = yup.object({
  as_of_date: requiredText(),
  portfolio_value: requiredText(),
  fund_value: requiredText(),
  direct_identified_value: requiredText(),
  opaque_value: requiredText(),
  decomposed_value: requiredText(),
  high_confidence_explained_value: requiredText(),
  undisclosed_fund_value: requiredText(),
  fund_coverage_pct: requiredText(),
  portfolio_coverage_pct: requiredText(),
  coverage_gate_pass: requiredText(),
  top_funds_gate_pass: requiredText(),
  exact_proxy_gate_pass: requiredText(),
  repeatability_gate_pass: requiredText(),
  feasibility_status: yup
    .string<FundCoverageReport['feasibilityStatus']>()
    .oneOf(['passed', 'pending_repeatability', 'limited'])
    .defined(),
  fund_count: requiredText(),
  issue_count: requiredText(),
})

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
  holdingKind?: string
  lookthroughPath?: string
  depth?: number
  snapshotId?: string
  sourceOrigin?: string
  sourceUrl?: string
}

export interface HistoricalFundHolding extends FundHolding {
  effectiveDate: string
  historySnapshotId: string
  capturedAt: string
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
  decompositionState: 'resolved' | 'partial' | 'unresolved' | 'stale'
  snapshotId: string
  sourceOrigin: string
  manualAttention: boolean
  checksumSha256: string
}

export interface FundSnapshot {
  fundId: string
  fundName: string
  snapshotId: string
  snapshotDate: string
  asOfDate: string
  generatedAt: string
  origin: string
  status: string
  isActive: boolean
  isStale: boolean
  ageDays: number
  holdingCount: number
  weightSum: number
  coveragePct: number
  complete: boolean
  sourceUrls: string[]
  evidencePath: string
  holdingsPath: string
  checksumSha256: string
  notes: string
  validationErrors: string
}

export interface FundUnresolved {
  parentId: string
  parentName: string
  unresolvedId: string
  unresolvedName: string
  reason: string
  path: string
  weight: number
  marketValue: number
  queuedForResearch: boolean
  detectedAt: string
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
  history: HistoricalFundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
  loading: boolean
}

const bool = (value: string | undefined) => value?.trim().toLowerCase() === 'true'
const num = (value: string | undefined) => Number.parseFloat(value || '0') || 0

export function useFundHoldingsData(): FundHoldingsData {
  const [data, setData] = useState<FundHoldingsData>({
    holdings: [], history: [], statuses: [], report: null, snapshots: [], unresolved: [], loading: true,
  })

  useEffect(() => {
    Promise.all([
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundHoldings, RAW_FUND_HOLDING_SCHEMA).catch(() => []),
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundHoldingsHistory, RAW_FUND_HOLDING_HISTORY_SCHEMA).catch(() => []),
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundHoldingsStatus, RAW_FUND_HOLDING_STATUS_SCHEMA).catch(() => []),
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundHoldingsCoverage, RAW_FUND_COVERAGE_REPORT_SCHEMA).catch(() => []),
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundSnapshotManifest, RAW_FUND_SNAPSHOT_SCHEMA).catch(() => []),
      parseCsv(PORTFOLIO_ENDPOINTS.data.fundUnresolved, RAW_FUND_UNRESOLVED_SCHEMA).catch(() => []),
    ]).then(([holdingRows, historyRows, statusRows, reportRows, snapshotRows, unresolvedRows]) => {
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
          sourceTier: row.source_tier || '',
          sourceName: row.source_name?.trim() || '',
          holdingsDate: row.holdings_date?.trim() || '',
          holdingKind: row.holding_kind?.trim() || 'security',
          lookthroughPath: row.lookthrough_path?.trim() || '',
          depth: num(row.depth),
          snapshotId: row.snapshot_id?.trim() || '',
          sourceOrigin: row.source_origin?.trim() || 'deterministic',
          sourceUrl: row.source_url?.trim() || '',
        }))
        .filter((row) => row.holdingId && row.holdingName && row.weight > 0)

      const history = historyRows
        .map((row): HistoricalFundHolding => ({
          parentIsin: row.parent_isin?.trim() || '',
          parentTicker: row.parent_ticker?.trim() || '',
          parentName: row.parent_name?.trim() || '',
          holdingId: row.holding_id?.trim() || '',
          holdingName: row.holding_name?.trim() || '',
          issuerId: row.issuer_id?.trim() || row.holding_id?.trim() || '',
          issuerName: row.issuer_name?.trim() || row.holding_name?.trim() || '',
          weight: num(row.weight),
          sourceTier: row.source_tier || '',
          sourceName: row.source_name?.trim() || '',
          holdingsDate: row.holdings_date?.trim() || '',
          holdingKind: row.holding_kind?.trim() || 'security',
          lookthroughPath: row.lookthrough_path?.trim() || '',
          depth: num(row.depth),
          snapshotId: row.snapshot_id?.trim() || '',
          sourceOrigin: row.source_origin?.trim() || 'deterministic',
          sourceUrl: row.source_url?.trim() || '',
          effectiveDate: row.effective_date?.trim() || row.holdings_date?.trim() || '',
          historySnapshotId: row.history_snapshot_id?.trim() || '',
          capturedAt: row.captured_at?.trim() || '',
        }))
        .filter((row) => row.effectiveDate && row.historySnapshotId && row.holdingId && row.holdingName && row.weight > 0)

      const statuses = statusRows.map((row): FundHoldingStatus => ({
        parentId: row.parent_id?.trim() || row.parent_isin?.trim() || row.parent_ticker?.trim() || '',
        parentIsin: row.parent_isin?.trim() || '',
        parentTicker: row.parent_ticker?.trim() || '',
        parentName: row.parent_name?.trim() || '',
        qualityTier: row.quality_tier || 'D',
        validationStatus: row.validation_status || 'error',
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
        decompositionState: row.decomposition_state || 'unresolved',
        snapshotId: row.snapshot_id?.trim() || '',
        sourceOrigin: row.source_origin?.trim() || '',
        manualAttention: bool(row.manual_attention),
        checksumSha256: row.checksum_sha256?.trim() || '',
      }))

      const snapshots = snapshotRows.map((row): FundSnapshot => ({
        fundId: row.fund_id?.trim() || '',
        fundName: row.fund_name?.trim() || '',
        snapshotId: row.snapshot_id?.trim() || '',
        snapshotDate: row.snapshot_date?.trim() || '',
        asOfDate: row.as_of_date?.trim() || '',
        generatedAt: row.generated_at?.trim() || '',
        origin: row.origin?.trim() || '',
        status: row.status?.trim() || '',
        isActive: bool(row.is_active),
        isStale: bool(row.is_stale),
        ageDays: num(row.age_days),
        holdingCount: num(row.holding_count),
        weightSum: num(row.weight_sum),
        coveragePct: num(row.coverage_pct),
        complete: bool(row.complete),
        sourceUrls: (row.source_urls || '').split('|').map((value) => value.trim()).filter(Boolean),
        evidencePath: row.evidence_path?.trim() || '',
        holdingsPath: row.holdings_path?.trim() || '',
        checksumSha256: row.checksum_sha256?.trim() || '',
        notes: row.notes?.trim() || '',
        validationErrors: row.validation_errors?.trim() || '',
      }))

      const unresolved = unresolvedRows.map((row): FundUnresolved => ({
        parentId: row.parent_id?.trim() || '',
        parentName: row.parent_name?.trim() || '',
        unresolvedId: row.unresolved_id?.trim() || '',
        unresolvedName: row.unresolved_name?.trim() || '',
        reason: row.reason?.trim() || '',
        path: row.path?.trim() || '',
        weight: num(row.weight),
        marketValue: num(row.market_value),
        queuedForResearch: bool(row.queued_for_research),
        detectedAt: row.detected_at?.trim() || '',
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
        feasibilityStatus: rawReport.feasibility_status,
        fundCount: num(rawReport.fund_count),
        issueCount: num(rawReport.issue_count),
      } : null

      setData({ holdings, history, statuses, report, snapshots, unresolved, loading: false })
    })
  }, [])

  return data
}

/** Compatibility helper for consumers that only need constituent rows. */
export function useFundHoldings(): FundHolding[] {
  return useFundHoldingsData().holdings
}
