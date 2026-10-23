import type { AccountTypePoint } from '@/domains/portfolio/shared/types/history'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useAccountTypeLabels(accountTypeData: AccountTypePoint[] | undefined) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (accountTypeData ?? []).map((point) => {
    const percentage = point.total_cost_basis > 0 ? point.unrealized_gain / point.total_cost_basis * 100 : 0
    return { ...point, _label: `${formatMoney(point.total_value, { style: 'full' })} ${formatPercentage(percentage, { decimals: 0, signed: true })}` }
  })
}
