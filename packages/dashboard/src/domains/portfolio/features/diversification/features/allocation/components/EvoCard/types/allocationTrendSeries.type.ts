import type { AllocationTrendCategory } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/types/allocationTrend.type'

export type AllocationTrendSeries = {
  category: AllocationTrendCategory
  index: number
  label: string
  gradientId: string
}
