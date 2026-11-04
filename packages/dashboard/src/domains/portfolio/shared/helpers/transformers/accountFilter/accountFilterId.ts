import { CASH_SUFFIX } from '@/domains/portfolio/shared/constants/accountCategories/cashSuffix'

import type { AccountFilterRow } from './accountFilter.types'
import { CASH_ACCOUNT_FILTER_SUFFIX } from './cashAccountFilterSuffix'

export function accountFilterId(row: AccountFilterRow): string {
  return row.account_type?.endsWith(CASH_SUFFIX)
    ? `${row.account}${CASH_ACCOUNT_FILTER_SUFFIX}`
    : row.account
}
