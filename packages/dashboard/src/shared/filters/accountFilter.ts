import { CASH_SUFFIX } from '@/shared/constants/accountCategories'

export const CASH_ACCOUNT_FILTER_SUFFIX = '::cash'

export interface AccountFilterRow {
  account: string
  account_type?: string
}

export function accountFilterId(row: AccountFilterRow): string {
  return row.account_type?.endsWith(CASH_SUFFIX)
    ? `${row.account}${CASH_ACCOUNT_FILTER_SUFFIX}`
    : row.account
}

export function rawAccountId(accountId: string): string {
  return accountId.endsWith(CASH_ACCOUNT_FILTER_SUFFIX)
    ? accountId.slice(0, -CASH_ACCOUNT_FILTER_SUFFIX.length)
    : accountId
}

export function rawAccountSet(accountIds?: Set<string>): Set<string> | null {
  if (!accountIds || accountIds.size === 0) return null
  return new Set([...accountIds].map(rawAccountId))
}
