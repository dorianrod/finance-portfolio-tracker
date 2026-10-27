// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_FUND_HOLDING_HISTORY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingHistorySchema'
import { RAW_FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingSchema'
import { RAW_FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/rawFundHoldingStatusSchema'
import { mapFundHolding } from '@/domains/portfolio/shared/helpers/mappers/mapFundHolding'
import { mapFundHoldingStatus } from '@/domains/portfolio/shared/helpers/mappers/mapFundHoldingStatus'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import { parseOptionalCsv } from '@/shared/csv/csvData/parseOptionalCsv'

export function useGetFundHoldingsQuery() {
  return useQuery<FundHoldingsData>({
    queryKey: portfolioQueryKeys.data('fund-holdings'),
    queryFn: async () => {
      const [holdingRows, historyRows, statusRows] = await Promise.all([
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

      return { holdings, history, statuses }
    },
  })
}
