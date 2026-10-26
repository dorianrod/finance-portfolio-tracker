import { CASH_SUFFIX } from '@/domains/portfolio/shared/constants/accountCategories/cashSuffix'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { NON_INVESTMENT_CATEGORIES } from './nonInvestmentCategories'

export function isApplicable(row: RawPosition): boolean {
  const category = row.account_category?.trim().toLowerCase() ?? ''
  const accountType = row.account_type?.trim().toLowerCase() ?? ''
  return (
    !NON_INVESTMENT_CATEGORIES.has(category) &&
    !accountType.endsWith(CASH_SUFFIX.toLowerCase())
  )
}
