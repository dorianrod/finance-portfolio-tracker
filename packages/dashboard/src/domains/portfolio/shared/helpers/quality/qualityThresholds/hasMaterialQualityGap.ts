import { QUALITY_GAP_TOLERANCE_PCT } from './qualityGapTolerancePct'

/** Gaps below this percentage are considered operationally complete. */
export function hasMaterialQualityGap(percentage: number): boolean {
  return percentage >= QUALITY_GAP_TOLERANCE_PCT
}
