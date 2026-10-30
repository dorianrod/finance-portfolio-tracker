import { QUALITY_GAP_TOLERANCE_PCT } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/qualityThresholds/qualityGapTolerancePct'

/** Gaps below this percentage are considered operationally complete. */
export function hasMaterialQualityGap(percentage: number): boolean {
  return percentage >= QUALITY_GAP_TOLERANCE_PCT
}
