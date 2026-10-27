import type { MonthlyOperation } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'

export function selectMonthlyTooltipOperations(operations: MonthlyOperation[]) {
  const deposits: OperationEntry[] = []
  const withdrawals: OperationEntry[] = []
  for (const [id, operation] of operations.entries()) {
    if (
      operation.operation_type === 'WITHDRAWAL' ||
      operation.total_amount < 0
    ) {
      withdrawals.push({ id, operation })
    } else if (operation.total_amount > 0) {
      deposits.push({ id, operation })
    }
  }
  return { deposits, withdrawals }
}

// Source order identifies individual records in an immutable monthly snapshot.
type OperationEntry = { id: number; operation: MonthlyOperation }
