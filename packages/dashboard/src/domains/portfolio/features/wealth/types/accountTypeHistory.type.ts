import type { AccountCategory } from '@/domains/portfolio/shared/types/accountCategory.type'

export type AccountTypeHistory = {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, AccountCategory>
}

export type AccountTypeHistoryPoint = {
  date: Date
  values: Record<string, number>
}
