import type {
  AccountTypeHistory,
  AccountTypeHistoryPoint,
} from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { CATEGORY_ORDER } from '@/domains/portfolio/shared/constants/accountCategories/categoryOrder'
import { accountFilterId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/accountFilterId'
import type { AccountCategory } from '@/domains/portfolio/shared/types/accountCategory.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export function buildAccountTypeHistory(
  rows: RawPositionRow[],
  accountSet: Set<string> | null,
): AccountTypeHistory {
  const byDate = new Map<number, Map<string, number>>()
  const typeSet = new Set<string>()
  const typeCategories = new Map<string, AccountCategory>()

  for (const row of rows) {
    if (!isIncludedAccountTypeRow(row, accountSet)) continue
    const tv = row.total_value ?? 0
    typeSet.add(row.account_type)
    if (row.account_category)
      typeCategories.set(row.account_type, row.account_category)
    const dateMap =
      byDate.get(row.snapshot_date.getTime()) ?? new Map<string, number>()
    dateMap.set(row.account_type, (dateMap.get(row.account_type) ?? 0) + tv)
    byDate.set(row.snapshot_date.getTime(), dateMap)
  }

  const accountTypes = [...typeSet].toSorted((a, b) => {
    const ia = categoryRank(typeCategories.get(a))
    const ib = categoryRank(typeCategories.get(b))
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, 'en')
  })

  const data: AccountTypeHistoryPoint[] = [...byDate.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([date, typeMap]) => {
      return {
        date: new Date(date),
        values: Object.fromEntries(
          accountTypes.map((type) => [
            type,
            Math.round(typeMap.get(type) ?? 0),
          ]),
        ),
      }
    })

  return {
    data,
    accountTypes,
    typeCategories: Object.fromEntries(typeCategories),
  }
}

function isIncludedAccountTypeRow(
  row: RawPositionRow,
  accounts: Set<string> | null,
) {
  if (!row.account_type || (row.total_value ?? 0) === 0) return false
  return accounts === null || accounts.has(accountFilterId(row))
}

function categoryRank(category: AccountCategory | undefined) {
  return CATEGORY_ORDER.get(category ?? '') ?? -1
}
