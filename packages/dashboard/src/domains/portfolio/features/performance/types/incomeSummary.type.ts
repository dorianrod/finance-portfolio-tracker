export type IncomeSummary = {
  dividends: number
  interest: number
  total: number
  previousTotal: number
  // No change percentage exists without a reporting window or a comparable prior total.
  changePct: number | null
  // Without income operations or an explicit reporting date there is no window.
  dateFrom: Date | null
  // Without income operations or an explicit reporting date there is no window.
  dateTo: Date | null
}
