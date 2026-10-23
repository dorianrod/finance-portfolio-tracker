export type AllocationDimension = 'geo' | 'secteur' | 'currency' | 'classe'
export type AllocationFilter = { type: AllocationDimension; value: string }

export interface PieEntry {
  name: string
  value: number
  total: number
  subItems?: Array<{ name: string; value: number }>
}

export interface MatchingIsinRow {
  isin: string
  name: string
  totalValue: number
  filteredValue: number
}
