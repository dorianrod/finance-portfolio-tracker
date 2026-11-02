import { type ChartAge, chartAgeOpacity } from '@/shared/ui/chartAgeAppearance'

export function getChartLabelAgeAppearance(age: ChartAge | undefined) {
  if (!age) return undefined
  return {
    fillOpacity: chartAgeOpacity(age),
    fontWeight: age.recent ? 600 : 400,
    pointerEvents: 'none' as const,
  }
}
