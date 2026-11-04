import { CASH_ACCOUNT_FILTER_SUFFIX } from './cashAccountFilterSuffix'

export function rawAccountId(accountId: string): string {
  return accountId.endsWith(CASH_ACCOUNT_FILTER_SUFFIX)
    ? accountId.slice(0, -CASH_ACCOUNT_FILTER_SUFFIX.length)
    : accountId
}
