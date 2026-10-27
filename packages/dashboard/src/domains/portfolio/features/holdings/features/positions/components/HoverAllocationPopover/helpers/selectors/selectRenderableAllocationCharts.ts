import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

export function selectRenderableAllocationCharts(
  charts: Array<{ title: string; point: AllocationPoint | null | undefined }>,
) {
  return charts.filter(
    (chart): chart is { title: string; point: AllocationPoint } =>
      chart.point != null && chart.point.categories.length > 0,
  )
}
