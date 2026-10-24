import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'

export type RawPassiveIncomeOp = {
  date: string
  account: string
  operation_type: string
  total_amount: number
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
    const amount = row.total_amount
    const cur = byYear.get(year) ?? { dividends: 0, interest: 0 }
    if (row.operation_type === 'DIVIDEND') cur.dividends += amount
    else cur.interest += amount
    byYear.set(year, cur)
  }

  return [...byYear.entries()]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([year, { dividends, interest }]) => ({
      year: Number(year),
      dividends: Math.round(dividends),
      interest: Math.round(interest),
    }))
}
