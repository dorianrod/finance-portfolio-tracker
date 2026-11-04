import type { PassiveIncomePoint } from '@/domains/portfolio/features/performance/types/passiveIncomePoint.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'

export function aggregatePassiveIncomeByYear(
  rows: RawPassiveIncomeOp[],
  accountSet: Set<string> | null,
  dateFrom?: Date,
  dateTo?: Date,
): PassiveIncomePoint[] {
  const byYear = new Map<string, { dividends: number; interest: number }>()

  for (const row of rows) {
    if (!isSelectedIncome(row, accountSet, dateFrom, dateTo)) continue
    const year = String(row.date.getUTCFullYear())
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

export type RawPassiveIncomeOp = Pick<
  RawOperation,
  'date' | 'account' | 'operation_type' | 'total_amount'
>

function isSelectedIncome(
  row: RawPassiveIncomeOp,
  accounts: Set<string> | null,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
) {
  if (!['DIVIDEND', 'INTEREST'].includes(row.operation_type)) return false
  if (accounts && !accounts.has(row.account)) return false
  if (dateFrom && row.date < dateFrom) return false
  if (dateTo && row.date > dateTo) return false
  return true
}
