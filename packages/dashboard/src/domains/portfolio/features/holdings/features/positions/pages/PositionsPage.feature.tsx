import { PositionsTable } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/PositionsTable.feature'
import { usePositionsModel } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionsModel'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
export function PositionsPage() {
  useGetPortfolioSourcesQuery()
  const { tableData, fundStatuses, useGroupedPositionsTable } =
    usePositionsModel()
  return (
    <PositionsTable
      data={tableData}
      fundStatuses={fundStatuses}
      groupByAccountType={useGroupedPositionsTable}
    />
  )
}
