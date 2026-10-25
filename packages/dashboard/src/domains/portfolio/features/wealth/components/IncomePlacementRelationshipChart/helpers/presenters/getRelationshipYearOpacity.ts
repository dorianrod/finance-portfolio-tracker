export function getRelationshipYearOpacity(
  year: number,
  isRecent: boolean,
  oldestYear: number,
  newestYear: number,
): number {
  if (isRecent) return 1
  const ageProgress = (year - oldestYear) / Math.max(1, newestYear - oldestYear)
  return 0.3 + ageProgress * 0.35
}
