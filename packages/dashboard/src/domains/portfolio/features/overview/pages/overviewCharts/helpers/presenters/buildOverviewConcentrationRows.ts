import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'

export function buildOverviewConcentrationRows(
  concentration: OverviewConcentrationComparison,
) {
  const current = concentration.current
  const previousByKey = new Map(
    concentration.previous?.holdings.map((holding) => [
      holding.key,
      holding.weight,
    ]) ?? [],
  )
  const rows =
    current?.holdings.slice(0, 5).map((holding) => ({
      ...holding,
      previousWeight: concentration.previous
        ? (previousByKey.get(holding.key) ?? 0)
        : null,
    })) ?? []
  const scaleMax = Math.max(
    1,
    ...rows.flatMap((row) => [row.weight, row.previousWeight ?? 0]),
  )
  const previousAvailable = concentration.previous != null
  return { rows, scaleMax, previousAvailable }
}
