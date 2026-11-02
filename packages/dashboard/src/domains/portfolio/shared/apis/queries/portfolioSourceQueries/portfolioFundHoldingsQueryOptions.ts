import { queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingSchema'
import { FUND_HOLDING_STATUS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/fundHoldingStatusSchema'
import { HISTORICAL_FUND_HOLDING_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/historicalFundHoldingSchema'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import { parseOptionalCsv } from '@/shared/csv/csvData/parseOptionalCsv'

export const PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('fund-holdings'),
  queryFn: async (): Promise<FundHoldingsData> => {
    const [holdingRows, historyRows, statusRows] = await Promise.all([
      parseOptionalCsv(
        PORTFOLIO_ENDPOINTS.data.fundHoldings,
        FUND_HOLDING_SCHEMA,
      ),
      parseOptionalCsv(
        PORTFOLIO_ENDPOINTS.data.fundHoldingsHistory,
        HISTORICAL_FUND_HOLDING_SCHEMA,
      ),
      parseOptionalCsv(
        PORTFOLIO_ENDPOINTS.data.fundHoldingsStatus,
        FUND_HOLDING_STATUS_SCHEMA,
      ),
    ])
    const holdings = holdingRows.filter(
      (row) => row.holdingId !== '' && row.holdingName !== '' && row.weight > 0,
    )

    const history = historyRows.filter(
      (row) =>
        row.effectiveDate != null &&
        row.historySnapshotId !== '' &&
        row.holdingId !== '' &&
        row.holdingName !== '' &&
        row.weight > 0,
    )

    const statuses = statusRows

    return { holdings, history, statuses }
  },
})
