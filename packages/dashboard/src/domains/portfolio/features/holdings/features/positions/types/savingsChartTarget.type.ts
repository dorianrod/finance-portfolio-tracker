export type SavingsChartTarget = {
  name: string
  operations: { date: Date; total_amount: number; operation_type: string }[]
  buttonRect: DOMRect
}
