import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import { Skeleton } from '@/shared/ui/Skeleton.view'

export function HoldingsSkeleton({ view }: { view: HoldingsView }) {
  return <Skeleton.Table columns={view === 'positions' ? 10 : 4} />
}
