export type AllocationCoverageIssue = {
  id: string
  name: string
  value: number
  unallocated: number
}

export type DimensionCoverage = {
  dimension: 'geo' | 'secteur' | 'currency' | 'classe'
  allocated: number
  unallocated: number
  issues: AllocationCoverageIssue[]
}
