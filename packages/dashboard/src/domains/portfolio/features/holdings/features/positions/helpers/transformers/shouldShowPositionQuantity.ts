import { CASH_SUFFIX } from '@/domains/portfolio/shared/constants/accountCategories/cashSuffix'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function shouldShowPositionQuantity(position: PositionRow): boolean {
  return (
    position.account_category === 'brokerage' &&
    !position.account_type?.endsWith(CASH_SUFFIX) &&
    position.quantity != null
  )
}
