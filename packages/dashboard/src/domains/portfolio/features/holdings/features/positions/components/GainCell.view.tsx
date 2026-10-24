import { gainClass } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainClass'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function GainCell({ value, pct }: { value: number | null; pct?: number | null }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (value == null) return <span className="text-content-subtle">—</span>
  return (
    <span className={gainClass(value)}>
      {formatMoney(value)}
      {pct != null && (
        <span className="ml-1 text-xs opacity-80">
          {formatPercentage(pct, { decimals: 2, signed: true })}
        </span>
      )}
    </span>
  )
}
