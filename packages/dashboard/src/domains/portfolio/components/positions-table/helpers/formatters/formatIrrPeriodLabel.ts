export function formatIrrPeriodLabel(years: number | null): string {
  if (years == null || years >= 3) return '3y'
  if (years >= 1) return `${Math.floor(years * 10) / 10}y`
  return `${Math.max(1, Math.round(years * 12))}mo`
}
