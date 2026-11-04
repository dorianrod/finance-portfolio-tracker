export function partitionPercentages(values: number[]): number[] {
  const safeValues = values.map((value) =>
    Number.isFinite(value) ? Math.max(0, value) : 0,
  )
  const maximum = safeValues.reduce(
    (largest, value) => Math.max(largest, value),
    0,
  )
  if (maximum === 0) return safeValues.map(() => 0)

  // Normalize before summing so finite inputs cannot overflow the denominator.
  const scaledValues = safeValues.map((value) => value / maximum)
  const total = scaledValues.reduce((sum, value) => sum + value, 0)

  const unitsPerPercent = 10 ** PERCENTAGE_DECIMAL_PLACES
  const targetUnits = 100 * unitsPerPercent
  const exactUnits = scaledValues.map((value) => (value / total) * targetUnits)
  const roundedUnits = exactUnits.map(Math.floor)
  const missingUnits =
    targetUnits - roundedUnits.reduce((sum, value) => sum + value, 0)
  const remainderOrder = exactUnits
    .map((value, index) => ({ index, remainder: value - roundedUnits[index] }))
    .toSorted((a, b) => {
      const difference = b.remainder - a.remainder
      return difference === 0 ? a.index - b.index : difference
    })

  for (let index = 0; index < missingUnits; index += 1) {
    roundedUnits[remainderOrder[index].index] += 1
  }

  return roundedUnits.map((value) => value / unitsPerPercent)
}

const PERCENTAGE_DECIMAL_PLACES = 1
