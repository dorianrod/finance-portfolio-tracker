import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'

export type AllocationHoverTarget = {
  isin: string
  name: string
  buttonRect: DOMRect
  allocation: IsinAllocation
}
