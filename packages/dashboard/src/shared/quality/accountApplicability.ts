import type { PositionRow } from '@/types/domain'
import { CASH_SUFFIX } from '@/shared/constants/accountCategories'

const NON_INVESTMENT_ACCOUNT_CATEGORIES = new Set(['savings', 'checking'])

export function isAssetAnalysisApplicablePosition(position: PositionRow): boolean {
  const category = position.account_category?.trim().toLowerCase() ?? ''
  const accountType = position.account_type?.trim().toLowerCase() ?? ''
  const isBrokerageCash = accountType.endsWith(CASH_SUFFIX.toLowerCase())
  return !NON_INVESTMENT_ACCOUNT_CATEGORIES.has(category) && !isBrokerageCash
}
