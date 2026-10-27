// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_FUND_COVERAGE_REPORT_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundCoverageReportSchema'
import { RAW_FUND_HOLDING_HISTORY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingHistorySchema'
import { RAW_FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingSchema'
import { RAW_FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingStatusSchema'
import { RAW_FUND_SNAPSHOT_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundSnapshotSchema'
import { RAW_FUND_UNRESOLVED_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundUnresolvedSchema'
import { mapFundHolding } from '@/domains/portfolio/shared/helpers/mappers/mapFundHolding'
import { mapFundHoldingStatus } from '@/domains/portfolio/shared/helpers/mappers/mapFundHoldingStatus'
import type {
  FundHoldingsData,
  FundSnapshot,
  FundUnresolved,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import { parseOptionalCsv } from '@/shared/csv/csvData/parseOptionalCsv'

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
        .map(mapFundHolding)
        .filter(
          (row) =>
            row.holdingId !== '' && row.holdingName !== '' && row.weight > 0,
        )

      const history = historyRows
        .map((row): HistoricalFundHolding => ({
          ...mapFundHolding(row),
          effectiveDate: row.effective_date,
          historySnapshotId: row.history_snapshot_id,
          capturedAt: row.captured_at,
        }))
        .filter(
          (row) =>
            row.effectiveDate != null &&
            row.historySnapshotId !== '' &&
            row.holdingId !== '' &&
            row.holdingName !== '' &&
            row.weight > 0,
        )

      const statuses = statusRows.map(mapFundHoldingStatus)

      const snapshots = snapshotRows.map((row): FundSnapshot => ({
        fundId: row.fund_id,
        fundName: row.fund_name,
        snapshotId: row.snapshot_id,
        snapshotDate: row.snapshot_date,
        asOfDate: row.as_of_date,
        generatedAt: row.generated_at,
        origin: row.origin,
        status: row.status,
        isActive: row.is_active,
        isStale: row.is_stale,
        ageDays: row.age_days,
        holdingCount: row.holding_count,
        weightSum: row.weight_sum,
        coveragePct: row.coverage_pct,
        complete: row.complete,
        sourceUrls: row.source_urls
          .split('|')
          .map((value) => value.trim())
          .filter(Boolean),
        evidencePath: row.evidence_path,
        holdingsPath: row.holdings_path,
        checksumSha256: row.checksum_sha256,
        notes: row.notes,
        validationErrors: row.validation_errors,
      }))

      const unresolved = unresolvedRows.map((row): FundUnresolved => ({
        parentId: row.parent_id,
        parentName: row.parent_name,
        unresolvedId: row.unresolved_id,
        unresolvedName: row.unresolved_name,
        reason: row.reason,
        path: row.path,
        weight: row.weight,
        marketValue: row.market_value,
        queuedForResearch: row.queued_for_research,
        detectedAt: row.detected_at,
      }))

      const rawReport = reportRows[0]
      const report =
        rawReport == null
          ? null
          : {
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

      return { holdings, history, statuses, report, snapshots, unresolved }
    },
  })
}
