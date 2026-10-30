import type { OverviewWindows } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { useDashboardFilterPanel } from '@/domains/portfolio/shared/services/actions/useDashboardFilterPanel'

import { OverviewPeriodFilterView } from './OverviewPeriodFilter.view'

/*
 * @architecture-decision comparison-period-control
 * @rules arch-component-roles, arch-component-module-boundaries
 * @choice Resolve the filter action here; supply ranges and onOpen to the comparison view.
 * @reason The current/previous period control renders and activates without a dashboard store.
 * @alternative Combining action lookup and comparison layout hides the independent visual control.
 * @revisit The comparison control gains a business permission or an autonomous workflow.
 */
export function OverviewPeriodFilter({
  windows,
}: {
  windows: OverviewWindows
}) {
  const { openFilters } = useDashboardFilterPanel()
  return <OverviewPeriodFilterView windows={windows} onOpen={openFilters} />
}
