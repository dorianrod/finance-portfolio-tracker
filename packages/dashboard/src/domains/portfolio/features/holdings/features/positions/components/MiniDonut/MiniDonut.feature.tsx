import { buildAllocationPieData } from '@/domains/portfolio/shared/helpers/transformers/buildAllocationPieData'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

import { MiniDonutView } from './MiniDonut.view'

/*
 * @architecture-decision prepared-allocation-chart
 * @rules arch-component-roles, arch-component-module-boundaries
 * @choice Keep allocation grouping in this feature and render prepared entries in MiniDonutView.
 * @reason The plot, tooltip and legend have a supplied-data contract independent of allocation grouping.
 * @alternative Keeping the chart and allocation transformer together couples visual changes to business preparation.
 * @revisit A new plot interaction needs its own business state or a new consumer needs different grouping.
 */
export function MiniDonut({
  title,
  point,
}: {
  title: string
  point: AllocationPoint
}) {
  const { total, data } = buildAllocationPieData(point)
  return <MiniDonutView title={title} data={data} total={total} />
}
