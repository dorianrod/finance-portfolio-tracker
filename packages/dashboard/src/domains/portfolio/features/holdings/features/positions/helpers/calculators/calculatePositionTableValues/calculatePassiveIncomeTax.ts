export function calculatePassiveIncomeTax(
  gross: number,
  net: number | null,
  taxRate: number | null,
): number | null {
  return gross > 0 && net != null && taxRate != null && taxRate > 0
    ? gross - net
    : null
}
