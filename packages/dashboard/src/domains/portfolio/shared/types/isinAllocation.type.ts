import type { AllocationPoint } from './allocationPoint.type'

export type IsinAllocation = {
  isin: string
  name: string
  geo: AllocationPoint | null
  secteur: AllocationPoint | null
  currency: AllocationPoint | null
  classe: AllocationPoint | null
}
