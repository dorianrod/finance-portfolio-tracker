import type { IsinAllocation } from './isinAllocation.type'

export type AllocationHoverTarget = {
  isin: string
  name: string
  buttonRect: DOMRect
  allocation: IsinAllocation
}
