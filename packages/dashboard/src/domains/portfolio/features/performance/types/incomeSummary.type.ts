export type IncomeSummary = {
  dividends: number
  interest: number
  total: number
  previousTotal: number
  changePct: number | null
  dateFrom: Date | null
  dateTo: Date | null
}
