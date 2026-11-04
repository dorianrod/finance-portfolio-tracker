export type MonthlyOperationType = 'DEPOSIT' | 'WITHDRAWAL'

export type MonthlyOperation = {
  date: Date
  account: string
  operation_type: MonthlyOperationType
  total_amount: number
}

export type MonthlyOperationsByMonth = Map<string, MonthlyOperation[]>
