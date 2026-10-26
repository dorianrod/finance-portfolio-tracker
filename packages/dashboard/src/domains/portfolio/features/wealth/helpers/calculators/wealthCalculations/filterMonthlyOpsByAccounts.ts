import type {
  MonthlyOperation,
  MonthlyOperationsByMonth,
} from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountSet'

export function filterMonthlyOpsByAccounts(
  allOps: MonthlyOperationsByMonth,
  accounts?: Set<string>,
): MonthlyOperationsByMonth {
  if (!accounts || accounts.size === 0) return allOps
  const rawAccounts = rawAccountSet(accounts)
  return new Map<string, MonthlyOperation[]>(
    [...allOps.entries()].map(([month, list]) => [
      month,
      list.filter((o) => rawAccounts?.has(o.account)),
    ]),
  )
}
