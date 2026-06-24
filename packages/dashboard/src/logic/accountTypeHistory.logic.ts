import { CATEGORY_ORDER } from '@/shared/constants/accountCategories'
import type { RawPositionRow } from '@/hooks/useAllPositions'

export interface AccountTypeHistoryPoint {
  date: string
  [key: string]: number | string
}

export interface AccountTypeHistory {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}

export function buildAccountTypeHistory(rows: RawPositionRow[], accountSet: Set<string> | null): AccountTypeHistory {
  const byDate = new Map<string, Map<string, number>>()
  const typeSet = new Set<string>()
  const typeCategories: Record<string, string> = {}

  for (const row of rows) {
    if (!row.account_type || !row.total_value) continue
    if (accountSet && !accountSet.has(row.account)) continue
    const tv = parseFloat(row.total_value) || 0
    typeSet.add(row.account_type)
    if (row.account_category) typeCategories[row.account_type] = row.account_category
    const dateMap = byDate.get(row.snapshot_date) ?? new Map<string, number>()
    dateMap.set(row.account_type, (dateMap.get(row.account_type) ?? 0) + tv)
    byDate.set(row.snapshot_date, dateMap)
  }

  const accountTypes = [...typeSet].sort((a, b) => {
    const ia = CATEGORY_ORDER[typeCategories[a] ?? ''] ?? -1
    const ib = CATEGORY_ORDER[typeCategories[b] ?? ''] ?? -1
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, 'en')
  })

  const data: AccountTypeHistoryPoint[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, typeMap]) => {
      const point: AccountTypeHistoryPoint = { date }
      for (const t of accountTypes) {
        point[t] = Math.round(typeMap.get(t) ?? 0)
      }
      return point
    })

  return { data, accountTypes, typeCategories }
}
