import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

export type IsinAllocation = {
  isin: string
  name: string
  // An asset may have no geographic allocation snapshot.
  geo: AllocationPoint | null
  // An asset may have no sector allocation snapshot.
  secteur: AllocationPoint | null
  // An asset may have no currency allocation snapshot.
  currency: AllocationPoint | null
  // An asset may have no asset-class allocation snapshot.
  classe: AllocationPoint | null
}
