/** Gaps below this percentage are considered operationally complete. */
export const QUALITY_GAP_TOLERANCE_PCT = 1

export function hasMaterialQualityGap(percentage: number): boolean {
  return percentage >= QUALITY_GAP_TOLERANCE_PCT
}
