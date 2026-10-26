import type {
  CumulativeConcentrationPoint,
  HoldingConcentration,
} from './concentrationCalculations.types'

export function buildCumulativeConcentration(
  holdings: HoldingConcentration[],
): CumulativeConcentrationPoint[] {
  let cumulativeWeight = 0

  return [...holdings]
    .toSorted((a, b) => b.value - a.value)
    .map((holding, index) => {
      cumulativeWeight += holding.weight
      return {
        ...holding,
        rank: index + 1,
        cumulativeWeight,
      }
    })
}
