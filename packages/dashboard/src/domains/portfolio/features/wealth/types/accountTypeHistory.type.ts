export type AccountTypeHistory = {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}

export type AccountTypeHistoryPoint = {
  date: Date
  values: Record<string, number>
}
