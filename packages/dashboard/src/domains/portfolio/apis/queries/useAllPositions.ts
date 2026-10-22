import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'
import type { RawPosition } from '@/domains/portfolio/types/domain'

export type RawPositionRow = Pick<
  RawPosition,
  | 'snapshot_date'
  | 'account'
  | 'account_type'
  | 'account_category'
  | 'quantity'
  | 'avg_buy_price'
  | 'total_value'
  | 'unrealized_gain'
>

export function useAllPositions() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('all-positions'),
    queryFn: () => parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
  })
}
