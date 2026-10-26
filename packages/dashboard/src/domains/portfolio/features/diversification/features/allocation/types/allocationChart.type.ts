export type AllocationDimension = 'geo' | 'secteur' | 'currency' | 'classe'
export type AllocationFilter = { type: AllocationDimension; value: string }

export type MatchingIsinRow = {
  isin: string
  name: string
  totalValue: number
  filteredValue: number
}
