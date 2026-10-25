import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import {
  RAW_FUND_COVERAGE_REPORT_SCHEMA,
  RAW_FUND_HOLDING_HISTORY_SCHEMA,
  RAW_FUND_HOLDING_SCHEMA,
  RAW_FUND_HOLDING_STATUS_SCHEMA,
  RAW_FUND_SNAPSHOT_SCHEMA,
  RAW_FUND_UNRESOLVED_SCHEMA,
} from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas'
import type {
  FundHolding,
  FundHoldingsData,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { parseOptionalCsv } from '@/shared/csv/csvData'

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
          parentIsin: row.parent_isin || '',
          parentTicker: row.parent_ticker || '',
          parentName: row.parent_name || '',
          holdingId: row.holding_id || '',
          holdingName: row.holding_name || '',
          issuerId: row.issuer_id || row.holding_id || '',
          issuerName: row.issuer_name || row.holding_name || '',
          weight: row.weight,
          sourceTier: row.source_tier || '',
          sourceName: row.source_name || '',
          holdingsDate: row.holdings_date,
          holdingKind: row.holding_kind || 'security',
          lookthroughPath: row.lookthrough_path || '',
          depth: row.depth,
          snapshotId: row.snapshot_id || '',
          sourceOrigin: row.source_origin || 'deterministic',
          sourceUrl: row.source_url || '',
        }))
        .filter((row) => row.holdingId && row.holdingName && row.weight > 0)

      const history = historyRows
        .map((row): HistoricalFundHolding => ({
          parentIsin: row.parent_isin || '',
          parentTicker: row.parent_ticker || '',
          parentName: row.parent_name || '',
          holdingId: row.holding_id || '',
          holdingName: row.holding_name || '',
          issuerId: row.issuer_id || row.holding_id || '',
          issuerName: row.issuer_name || row.holding_name || '',
          weight: row.weight,
          sourceTier: row.source_tier || '',
          sourceName: row.source_name || '',
          holdingsDate: row.holdings_date,
          holdingKind: row.holding_kind || 'security',
          lookthroughPath: row.lookthrough_path || '',
          depth: row.depth,
          snapshotId: row.snapshot_id || '',
          sourceOrigin: row.source_origin || 'deterministic',
          sourceUrl: row.source_url || '',
          effectiveDate: row.effective_date,
          historySnapshotId: row.history_snapshot_id || '',
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
        parentId: row.parent_id || row.parent_isin || row.parent_ticker || '',
        parentIsin: row.parent_isin || '',
        parentTicker: row.parent_ticker || '',
        parentName: row.parent_name || '',
        qualityTier: row.quality_tier || 'D',
        validationStatus: row.validation_status || 'error',
        sourceName: row.source_name || '',
        sourceType: row.source_type || '',
        sourceUrl: row.source_url || '',
        indexName: row.index_name || '',
        replicationMethod: row.replication_method || '',
        proxyName: row.proxy_name || '',
        proxyIsin: row.proxy_isin || '',
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
        issues: row.issues || '',
        decompositionState: row.decomposition_state || 'unresolved',
        snapshotId: row.snapshot_id || '',
        sourceOrigin: row.source_origin || '',
        manualAttention: row.manual_attention ?? false,
        checksumSha256: row.checksum_sha256?.trim() || '',
      }))

      const snapshots = snapshotRows.map((row): FundSnapshot => ({
        fundId: row.fund_id || '',
        fundName: row.fund_name || '',
        snapshotId: row.snapshot_id || '',
        snapshotDate: row.snapshot_date,
        asOfDate: row.as_of_date,
        generatedAt: row.generated_at,
        origin: row.origin || '',
        status: row.status || '',
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
        evidencePath: row.evidence_path || '',
        holdingsPath: row.holdings_path || '',
        checksumSha256: row.checksum_sha256?.trim() || '',
        notes: row.notes || '',
        validationErrors: row.validation_errors || '',
      }))

      const unresolved = unresolvedRows.map((row): FundUnresolved => ({
        parentId: row.parent_id || '',
        parentName: row.parent_name || '',
        unresolvedId: row.unresolved_id || '',
        unresolvedName: row.unresolved_name || '',
        reason: row.reason || '',
        path: row.path || '',
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
