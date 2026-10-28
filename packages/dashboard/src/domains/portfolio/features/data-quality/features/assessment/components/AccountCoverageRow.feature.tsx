import { summarizeAllocationCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/summarizeAllocationCoverage'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import { useAccountFilterLabels } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/useAccountFilterLabels'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'

import { AccountCoverageRowView } from './AccountCoverageRow.view'

export function AccountCoverageRow({
  coverage,
}: {
  coverage: AccountCoverage
}) {
  const formatAccountLabel = useFormatAccountLabel()
  const accountLabels = useAccountFilterLabels()
  const summaryValues = summarizeAllocationCoverage([coverage])
  if (summaryValues.total <= 0) return null
  return (
    <AccountCoverageRowView
      coverage={coverage}
      label={formatAccountLabel(coverage.account, { labels: accountLabels })}
      summaryValues={summaryValues}
    />
  )
}
