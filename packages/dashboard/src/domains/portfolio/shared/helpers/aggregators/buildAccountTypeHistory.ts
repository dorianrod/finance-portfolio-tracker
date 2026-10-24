import { CATEGORY_ORDER } from '@/domains/portfolio/shared/constants/accountCategories'
import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export type AccountTypeHistoryPoint = {
  date: Date
  [key: string]: number | Date
}

export type AccountTypeHistory = {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}

export function buildAccountTypeHistory(
  rows: RawPositionRow[],
  accountSet: Set<string> | null,
): AccountTypeHistory {
  const byDate = new Map<number, Map<string, number>>()
  const typeSet = new Set<string>()
  const typeCategories: Record<string, string> = {}

  for (const row of rows) {
    if (!row.account_type || !row.total_value) continue
    if (accountSet && !accountSet.has(accountFilterId(row))) continue
    const tv = row.total_value || 0
    typeSet.add(row.account_type)
    if (row.account_category)
      typeCategories[row.account_type] = row.account_category
    const dateMap =
      byDate.get(row.snapshot_date.getTime()) ?? new Map<string, number>()
    dateMap.set(row.account_type, (dateMap.get(row.account_type) ?? 0) + tv)
    byDate.set(row.snapshot_date.getTime(), dateMap)
  }

  const accountTypes = [...typeSet].toSorted((a, b) => {
    const ia = CATEGORY_ORDER[typeCategories[a] ?? ''] ?? -1
    const ib = CATEGORY_ORDER[typeCategories[b] ?? ''] ?? -1
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, 'en')
  })

  const data: AccountTypeHistoryPoint[] = [...byDate.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([date, typeMap]) => {
      const point: AccountTypeHistoryPoint = { date: new Date(date) }
      for (const t of accountTypes) {
        point[t] = Math.round(typeMap.get(t) ?? 0)
      }
      return point
    })

  return { data, accountTypes, typeCategories }
}
