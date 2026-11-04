export const ALL_ACCOUNT_CATEGORIES = [
  'brokerage',
  'private_equity',
  'employer_savings',
  'retirement',
  'savings',
  'checking',
] as const

export type AccountCategory = (typeof ALL_ACCOUNT_CATEGORIES)[number]
