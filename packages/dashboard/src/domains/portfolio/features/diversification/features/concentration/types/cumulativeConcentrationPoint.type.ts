import type { HoldingConcentration } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'

export type CumulativeConcentrationPoint = HoldingConcentration & {
  rank: number
  cumulativeWeight: number
}
