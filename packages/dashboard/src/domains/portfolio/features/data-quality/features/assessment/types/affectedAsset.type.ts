import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityDimension.type'

export type AffectedAsset = {
  id: string
  name: string
  value: number
  dimensions: DataQualityDimension[]
  largestGapValue: number
  largestGapPct: number
}
