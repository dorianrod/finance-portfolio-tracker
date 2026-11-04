import { accountFilterId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/accountFilterId'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function matchesPositionScope(
  row: RawPosition,
  accountFilters: Set<string>,
  accountTypeFilters: Set<string>,
): boolean {
  return (
    (accountFilters.size === 0 || accountFilters.has(accountFilterId(row))) &&
    (accountTypeFilters.size === 0 ||
      accountTypeFilters.has(row.account_type ?? ''))
  )
}
