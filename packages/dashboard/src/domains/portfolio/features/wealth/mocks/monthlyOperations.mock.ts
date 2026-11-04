import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'

export function makeOps(): MonthlyOperationsByMonth {
  const map: MonthlyOperationsByMonth = new Map()
  map.set('2024-01', [
    {
      date: new Date('2024-01-05'),
      account: 'a1',
      operation_type: 'DEPOSIT',
      total_amount: 100,
    },
    {
      date: new Date('2024-01-10'),
      account: 'a2',
      operation_type: 'DEPOSIT',
      total_amount: 50,
    },
  ])
  return map
}
