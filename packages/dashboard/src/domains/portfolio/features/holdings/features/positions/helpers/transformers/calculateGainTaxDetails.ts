import { calculatePassiveIncomeTax } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/calculatePositionTableValues/calculatePassiveIncomeTax'

export function calculateGainTaxDetails(
  gross: number,
  net: number | null,
  taxRate: number | null,
): { amount: number; rate: number } | null {
  const amount = calculatePassiveIncomeTax(gross, net, taxRate)
  return taxRate != null && amount != null && amount > 0
    ? { amount, rate: taxRate }
    : null
}
