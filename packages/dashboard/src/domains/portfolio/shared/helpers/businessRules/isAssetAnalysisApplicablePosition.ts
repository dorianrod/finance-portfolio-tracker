import { CASH_SUFFIX } from '@/domains/portfolio/shared/constants/accountCategories/cashSuffix'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isAssetAnalysisApplicablePosition(
  position: Pick<PositionRow, 'account_category' | 'account_type'>,
): boolean {
  const category = position.account_category?.trim().toLowerCase() ?? ''
  const accountType = position.account_type?.trim().toLowerCase() ?? ''
  const isBrokerageCash = accountType.endsWith(CASH_SUFFIX.toLowerCase())
  return !NON_INVESTMENT_ACCOUNT_CATEGORIES.has(category) && !isBrokerageCash
}

const NON_INVESTMENT_ACCOUNT_CATEGORIES = new Set(['savings', 'checking'])
