export type HoldingConcentration = {
  label: string
  name: string
  value: number
  weight: number
}

export type CumulativeConcentrationPoint = HoldingConcentration & {
  rank: number
  cumulativeWeight: number
}

export type ConcentrationSummary = {
  topHoldingPct: number
  topFivePct: number
  topTenPct: number
  topTenValue: number
  coveragePct: number
  identifiedValue: number
  undisclosedValue: number
  opaqueValue: number
  selectedValue: number
  holdingCount: number
  allHoldings: HoldingConcentration[]
  holdings: HoldingConcentration[]
}
