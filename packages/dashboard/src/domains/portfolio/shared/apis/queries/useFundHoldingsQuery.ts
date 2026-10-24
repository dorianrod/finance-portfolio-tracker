import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingsData,
  FundHoldingStatus,
  FundQualityTier,
  FundSnapshot,
  FundUnresolved,
  FundValidationStatus,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { parseOptionalCsv } from '@/shared/csv/csvData'
import {
  CALENDAR_DATE_SCHEMA,
  OPTIONAL_CALENDAR_DATE_SCHEMA,
} from '@/shared/schemas/calendarDate.schema'

type RawFundHolding = {
  parent_isin: string
  parent_ticker: string
  parent_name: string
  holding_id: string
  holding_name: string
  issuer_id?: string
  issuer_name?: string
  weight: number
  source_tier?: FundQualityTier | ''
  source_name?: string
  holdings_date: Date | null
  holding_kind?: string
  lookthrough_path?: string
  depth?: number
  snapshot_id?: string
  source_origin?: string
  source_url?: string
}

type RawFundHoldingHistory = RawFundHolding & {
  effective_date: Date
  history_snapshot_id: string
  captured_at: Date | null
}

type RawFundHoldingStatus = {
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
  fetched_at: Date | null
  holdings_date: Date | null
  freshness_days: number
  is_stale: boolean
  holding_count: number
  raw_weight_sum: number
  explained_pct: number
  residual_pct: number
  market_value: number
  explained_value: number
  residual_value: number
  refresh_streak: number
  issues: string
  decomposition_state?: FundHoldingStatus['decompositionState'] | ''
  snapshot_id?: string
  source_origin?: string
  manual_attention?: boolean
  checksum_sha256?: string
}

type RawFundSnapshot = {
  fund_id: string
  fund_name: string
  snapshot_id: string
  snapshot_date: Date
  as_of_date: Date
  generated_at: Date | null
  origin: string
  status: string
  is_active: boolean
  is_stale: boolean
  age_days: number
  holding_count: number
  weight_sum: number
  coverage_pct: number
  complete: boolean
  source_urls: string
  evidence_path: string
  holdings_path: string
  checksum_sha256: string
  notes: string
  validation_errors: string
}

type RawFundUnresolved = {
  parent_id: string
  parent_name: string
  unresolved_id: string
  unresolved_name: string
  reason: string
  path: string
  weight: number
  market_value: number
  queued_for_research: boolean
  detected_at: Date | null
}

type RawFundCoverageReport = {
  as_of_date: Date
  portfolio_value: number
  fund_value: number
  direct_identified_value: number
  opaque_value: number
  decomposed_value: number
  high_confidence_explained_value: number
  undisclosed_fund_value: number
  fund_coverage_pct: number
  portfolio_coverage_pct: number
  coverage_gate_pass: boolean
  top_funds_gate_pass: boolean
  exact_proxy_gate_pass: boolean
  repeatability_gate_pass: boolean
  feasibility_status: FundCoverageReport['feasibilityStatus']
  fund_count: number
  issue_count: number
}

const requiredText = () => yup.string().defined()
const optionalText = () => yup.string().optional()
const requiredNumber = () =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null ? 0 : value,
    )
    .defined()
const optionalNumber = () =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null ? undefined : value,
    )
    .optional()
const requiredBoolean = () =>
  yup
    .boolean()
    .transform(
      (_value, originalValue) =>
        originalValue === true ||
        String(originalValue).trim().toLowerCase() === 'true',
    )
    .defined()
const optionalBoolean = () =>
  yup
    .boolean()
    .transform((_value, originalValue) =>
      originalValue === '' || originalValue == null
        ? undefined
        : originalValue === true ||
          String(originalValue).trim().toLowerCase() === 'true',
    )
    .optional()

const RAW_FUND_HOLDING_SCHEMA: yup.ObjectSchema<RawFundHolding> = yup.object({
  parent_isin: requiredText(),
  parent_ticker: requiredText(),
  parent_name: requiredText(),
  holding_id: requiredText(),
  holding_name: requiredText(),
  issuer_id: optionalText(),
  issuer_name: optionalText(),
  weight: requiredNumber(),
  source_tier: yup
    .string<FundQualityTier | ''>()
    .oneOf(['A', 'B', 'C', 'D', ''])
    .optional(),
  source_name: optionalText(),
  holdings_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  holding_kind: optionalText(),
  lookthrough_path: optionalText(),
  depth: optionalNumber(),
  snapshot_id: optionalText(),
  source_origin: optionalText(),
  source_url: optionalText(),
})

const RAW_FUND_HOLDING_HISTORY_SCHEMA: yup.ObjectSchema<RawFundHoldingHistory> =
  RAW_FUND_HOLDING_SCHEMA.shape({
    effective_date: CALENDAR_DATE_SCHEMA.required(),
    history_snapshot_id: requiredText(),
    captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  })

const RAW_FUND_HOLDING_STATUS_SCHEMA: yup.ObjectSchema<RawFundHoldingStatus> =
  yup.object({
    parent_id: requiredText(),
    parent_isin: requiredText(),
    parent_ticker: requiredText(),
    parent_name: requiredText(),
    quality_tier: yup
      .string<FundQualityTier | ''>()
      .oneOf(['A', 'B', 'C', 'D', ''])
      .defined(),
    validation_status: yup
      .string<FundValidationStatus | ''>()
      .oneOf(['ok', 'warning', 'error', ''])
      .defined(),
    source_name: requiredText(),
    source_type: requiredText(),
    source_url: requiredText(),
    index_name: requiredText(),
    replication_method: requiredText(),
    proxy_name: requiredText(),
    proxy_isin: requiredText(),
    fetched_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
    holdings_date: OPTIONAL_CALENDAR_DATE_SCHEMA,
    freshness_days: requiredNumber(),
    is_stale: requiredBoolean(),
    holding_count: requiredNumber(),
    raw_weight_sum: requiredNumber(),
    explained_pct: requiredNumber(),
    residual_pct: requiredNumber(),
    market_value: requiredNumber(),
    explained_value: requiredNumber(),
    residual_value: requiredNumber(),
    refresh_streak: requiredNumber(),
    issues: requiredText(),
    decomposition_state: yup
      .string<FundHoldingStatus['decompositionState'] | ''>()
      .oneOf(['resolved', 'partial', 'unresolved', 'stale', ''])
      .optional(),
    snapshot_id: optionalText(),
    source_origin: optionalText(),
    manual_attention: optionalBoolean(),
    checksum_sha256: optionalText(),
  })

const RAW_FUND_SNAPSHOT_SCHEMA: yup.ObjectSchema<RawFundSnapshot> = yup.object({
  fund_id: requiredText(),
  fund_name: requiredText(),
  snapshot_id: requiredText(),
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  as_of_date: CALENDAR_DATE_SCHEMA.required(),
  generated_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  origin: requiredText(),
  status: requiredText(),
  is_active: requiredBoolean(),
  is_stale: requiredBoolean(),
  age_days: requiredNumber(),
  holding_count: requiredNumber(),
  weight_sum: requiredNumber(),
  coverage_pct: requiredNumber(),
  complete: requiredBoolean(),
  source_urls: requiredText(),
  evidence_path: requiredText(),
  holdings_path: requiredText(),
  checksum_sha256: requiredText(),
  notes: requiredText(),
  validation_errors: requiredText(),
})

const RAW_FUND_UNRESOLVED_SCHEMA: yup.ObjectSchema<RawFundUnresolved> =
  yup.object({
    parent_id: requiredText(),
    parent_name: requiredText(),
    unresolved_id: requiredText(),
    unresolved_name: requiredText(),
    reason: requiredText(),
    path: requiredText(),
    weight: requiredNumber(),
    market_value: requiredNumber(),
    queued_for_research: requiredBoolean(),
    detected_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  })

const RAW_FUND_COVERAGE_REPORT_SCHEMA: yup.ObjectSchema<RawFundCoverageReport> =
  yup.object({
    as_of_date: CALENDAR_DATE_SCHEMA.required(),
    portfolio_value: requiredNumber(),
    fund_value: requiredNumber(),
    direct_identified_value: requiredNumber(),
    opaque_value: requiredNumber(),
    decomposed_value: requiredNumber(),
    high_confidence_explained_value: requiredNumber(),
    undisclosed_fund_value: requiredNumber(),
    fund_coverage_pct: requiredNumber(),
    portfolio_coverage_pct: requiredNumber(),
    coverage_gate_pass: requiredBoolean(),
    top_funds_gate_pass: requiredBoolean(),
    exact_proxy_gate_pass: requiredBoolean(),
    repeatability_gate_pass: requiredBoolean(),
    feasibility_status: yup
      .string<FundCoverageReport['feasibilityStatus']>()
      .oneOf(['passed', 'pending_repeatability', 'limited'])
      .defined(),
    fund_count: requiredNumber(),
    issue_count: requiredNumber(),
  })

export function useFundHoldingsQuery() {
  return useQuery<FundHoldingsData>({
    queryKey: portfolioQueryKeys.data('fund-holdings'),
    queryFn: async () => {
      const [
        holdingRows,
        historyRows,
        statusRows,
        reportRows,
        snapshotRows,
        unresolvedRows,
      ] = await Promise.all([
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundHoldings,
          RAW_FUND_HOLDING_SCHEMA,
        ),
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundHoldingsHistory,
          RAW_FUND_HOLDING_HISTORY_SCHEMA,
        ),
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundHoldingsStatus,
          RAW_FUND_HOLDING_STATUS_SCHEMA,
        ),
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundHoldingsCoverage,
          RAW_FUND_COVERAGE_REPORT_SCHEMA,
        ),
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundSnapshotManifest,
          RAW_FUND_SNAPSHOT_SCHEMA,
        ),
        parseOptionalCsv(
          PORTFOLIO_ENDPOINTS.data.fundUnresolved,
          RAW_FUND_UNRESOLVED_SCHEMA,
        ),
      ])
      const holdings = holdingRows
        .map((row): FundHolding => ({
          parentIsin: row.parent_isin?.trim() || '',
          parentTicker: row.parent_ticker?.trim() || '',
          parentName: row.parent_name?.trim() || '',
          holdingId: row.holding_id?.trim() || '',
          holdingName: row.holding_name?.trim() || '',
          issuerId: row.issuer_id?.trim() || row.holding_id?.trim() || '',
          issuerName: row.issuer_name?.trim() || row.holding_name?.trim() || '',
          weight: row.weight,
          sourceTier: row.source_tier || '',
          sourceName: row.source_name?.trim() || '',
          holdingsDate: row.holdings_date,
          holdingKind: row.holding_kind?.trim() || 'security',
          lookthroughPath: row.lookthrough_path?.trim() || '',
          depth: row.depth,
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
          weight: row.weight,
          sourceTier: row.source_tier || '',
          sourceName: row.source_name?.trim() || '',
          holdingsDate: row.holdings_date,
          holdingKind: row.holding_kind?.trim() || 'security',
          lookthroughPath: row.lookthrough_path?.trim() || '',
          depth: row.depth,
          snapshotId: row.snapshot_id?.trim() || '',
          sourceOrigin: row.source_origin?.trim() || 'deterministic',
          sourceUrl: row.source_url?.trim() || '',
          effectiveDate: row.effective_date,
          historySnapshotId: row.history_snapshot_id?.trim() || '',
          capturedAt: row.captured_at,
        }))
        .filter(
          (row) =>
            row.effectiveDate &&
            row.historySnapshotId &&
            row.holdingId &&
            row.holdingName &&
            row.weight > 0,
        )

      const statuses = statusRows.map((row): FundHoldingStatus => ({
        parentId:
          row.parent_id?.trim() ||
          row.parent_isin?.trim() ||
          row.parent_ticker?.trim() ||
          '',
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
        fetchedAt: row.fetched_at,
        holdingsDate: row.holdings_date,
        freshnessDays: row.freshness_days,
        isStale: row.is_stale,
        holdingCount: row.holding_count,
        rawWeightSum: row.raw_weight_sum,
        explainedPct: row.explained_pct,
        residualPct: row.residual_pct,
        marketValue: row.market_value,
        explainedValue: row.explained_value,
        residualValue: row.residual_value,
        refreshStreak: row.refresh_streak,
        issues: row.issues?.trim() || '',
        decompositionState: row.decomposition_state || 'unresolved',
        snapshotId: row.snapshot_id?.trim() || '',
        sourceOrigin: row.source_origin?.trim() || '',
        manualAttention: row.manual_attention ?? false,
        checksumSha256: row.checksum_sha256?.trim() || '',
      }))

      const snapshots = snapshotRows.map((row): FundSnapshot => ({
        fundId: row.fund_id?.trim() || '',
        fundName: row.fund_name?.trim() || '',
        snapshotId: row.snapshot_id?.trim() || '',
        snapshotDate: row.snapshot_date,
        asOfDate: row.as_of_date,
        generatedAt: row.generated_at,
        origin: row.origin?.trim() || '',
        status: row.status?.trim() || '',
        isActive: row.is_active,
        isStale: row.is_stale,
        ageDays: row.age_days,
        holdingCount: row.holding_count,
        weightSum: row.weight_sum,
        coveragePct: row.coverage_pct,
        complete: row.complete,
        sourceUrls: (row.source_urls || '')
          .split('|')
          .map((value) => value.trim())
          .filter(Boolean),
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
        weight: row.weight,
        marketValue: row.market_value,
        queuedForResearch: row.queued_for_research,
        detectedAt: row.detected_at,
      }))

      const rawReport = reportRows[0]
      const report = rawReport
        ? {
            asOfDate: rawReport.as_of_date,
            portfolioValue: rawReport.portfolio_value,
            fundValue: rawReport.fund_value,
            directIdentifiedValue: rawReport.direct_identified_value,
            opaqueValue: rawReport.opaque_value,
            decomposedValue: rawReport.decomposed_value,
            highConfidenceExplainedValue:
              rawReport.high_confidence_explained_value,
            undisclosedFundValue: rawReport.undisclosed_fund_value,
            fundCoveragePct: rawReport.fund_coverage_pct,
            portfolioCoveragePct: rawReport.portfolio_coverage_pct,
            coverageGatePass: rawReport.coverage_gate_pass,
            topFundsGatePass: rawReport.top_funds_gate_pass,
            exactProxyGatePass: rawReport.exact_proxy_gate_pass,
            repeatabilityGatePass: rawReport.repeatability_gate_pass,
            feasibilityStatus: rawReport.feasibility_status,
            fundCount: rawReport.fund_count,
            issueCount: rawReport.issue_count,
          }
        : null

      return { holdings, history, statuses, report, snapshots, unresolved }
    },
  })
}
