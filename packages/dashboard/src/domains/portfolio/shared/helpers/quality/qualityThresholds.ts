/** Gaps below this percentage are considered operationally complete. */
export function hasMaterialQualityGap(percentage: number): boolean {
  return percentage >= QUALITY_GAP_TOLERANCE_PCT
}

export const QUALITY_GAP_TOLERANCE_PCT = 1
