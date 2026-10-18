const PERCENTAGE_DECIMAL_PLACES = 1

export function formatPercentage(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  return safeValue.toFixed(PERCENTAGE_DECIMAL_PLACES)
}

export function partitionPercentages(values: number[]): number[] {
  const safeValues = values.map((value) => Number.isFinite(value) ? Math.max(0, value) : 0)
  const total = safeValues.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return safeValues.map(() => 0)

  const unitsPerPercent = 10 ** PERCENTAGE_DECIMAL_PLACES
  const targetUnits = 100 * unitsPerPercent
  const exactUnits = safeValues.map((value) => value / total * targetUnits)
  const roundedUnits = exactUnits.map(Math.floor)
  const missingUnits = targetUnits - roundedUnits.reduce((sum, value) => sum + value, 0)
  const remainderOrder = exactUnits
    .map((value, index) => ({ index, remainder: value - roundedUnits[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)

  for (let index = 0; index < missingUnits; index += 1) {
    roundedUnits[remainderOrder[index].index] += 1
  }

  return roundedUnits.map((value) => value / unitsPerPercent)
}
