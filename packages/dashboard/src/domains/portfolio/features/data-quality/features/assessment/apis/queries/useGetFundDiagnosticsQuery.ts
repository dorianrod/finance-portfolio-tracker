import { useSuspenseQuery } from '@tanstack/react-query'

import { RAW_FUND_COVERAGE_REPORT_SCHEMA } from '@/domains/portfolio/features/data-quality/features/assessment/apis/schemas/rawFundCoverageReportSchema'
import { RAW_FUND_SNAPSHOT_SCHEMA } from '@/domains/portfolio/features/data-quality/features/assessment/apis/schemas/rawFundSnapshotSchema'
import { RAW_FUND_UNRESOLVED_SCHEMA } from '@/domains/portfolio/features/data-quality/features/assessment/apis/schemas/rawFundUnresolvedSchema'
import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { parseOptionalCsv } from '@/shared/csv/csvData/parseOptionalCsv'

export function useGetFundDiagnosticsQuery() {
  return useSuspenseQuery<FundDiagnostics>({
    queryKey: portfolioQueryKeys.data('fund-diagnostics'),
    queryFn: async () => {
      const [reportRows, snapshotRows, unresolvedRows] = await Promise.all([
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

      return { report, snapshots, unresolved }
    },
  })
}
