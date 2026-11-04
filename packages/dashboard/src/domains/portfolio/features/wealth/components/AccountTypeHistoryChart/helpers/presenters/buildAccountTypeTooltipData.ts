import type { AccountTypeChartPoint } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/types/accountTypeChartPoint.type'
import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'

export function buildAccountTypeTooltipData(
  row: AccountTypeChartPoint | undefined,
  accountTypes: string[],
) {
  const values = accountTypes.map((accountType, index) => {
    const value = getOwnValue(row?.values, accountType) ?? 0
    return { accountType, index, value }
  })
  const total = row?.total ?? 0
  return {
    total,
    rows: values.map((item) => ({
      ...item,
      share: total > 0 ? (item.value / total) * 100 : null,
    })),
  }
}
