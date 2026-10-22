export interface RawPassiveIncomeOp {
  date: string
  account: string
  operation_type: string
  total_amount: string
}

export interface PassiveIncomePoint {
  year: string
  dividends: number
  interest: number
}

export function aggregatePassiveIncomeByYear(
  rows: RawPassiveIncomeOp[],
  accountSet: Set<string> | null,
  dateFrom?: string,
  dateTo?: string,
): PassiveIncomePoint[] {
  const byYear = new Map<string, { dividends: number; interest: number }>()

  for (const row of rows) {
    if (row.operation_type !== 'DIVIDEND' && row.operation_type !== 'INTEREST') continue
    if (accountSet && !accountSet.has(row.account)) continue
    if (dateFrom && row.date < dateFrom) continue
    if (dateTo && row.date > dateTo) continue
    const year = row.date?.slice(0, 4)
    if (!year) continue
    const amount = parseFloat(row.total_amount) || 0
    const cur = byYear.get(year) ?? { dividends: 0, interest: 0 }
    if (row.operation_type === 'DIVIDEND') cur.dividends += amount
    else cur.interest += amount
    byYear.set(year, cur)
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, { dividends, interest }]) => ({
      year,
      dividends: Math.round(dividends),
      interest: Math.round(interest),
    }))
}
