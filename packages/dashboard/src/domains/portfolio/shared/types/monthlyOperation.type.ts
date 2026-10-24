export type MonthlyOperationType = 'DEPOSIT' | 'WITHDRAWAL'

export type MonthlyOperation = {
  date: string
  account: string
  operation_type: MonthlyOperationType
  total_amount: number
}

export type MonthlyOperationsByMonth = Map<string, MonthlyOperation[]>
