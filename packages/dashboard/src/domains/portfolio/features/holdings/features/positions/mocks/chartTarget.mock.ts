import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'

export function createChartTarget(): ChartTarget {
  return {
    isin: 'FR0000000001',
    name: 'Example asset',
    operations: [],
    buttonRect: new DOMRect(10, 20, 30, 40),
  }
}
