import { useAtomValue } from 'jotai'

import { useDashboardDiversificationPositions } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationPositions'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpen.atoms'
import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

import { PositionsToggle } from './PositionsToggle.view'

export function AllocationPositionsToggle({
  dimension,
}: {
  dimension: AllocationDimension
}) {
  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const open = useAtomValue(dashboardDiversificationPositionsOpenAtom)
  const { togglePositions } = useDashboardDiversificationPositions()
  if (activeFilter?.type !== dimension) return null
  return <PositionsToggle open={open} onClick={togglePositions} />
}
