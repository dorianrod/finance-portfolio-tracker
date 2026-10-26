import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainTone'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Text } from '@/shared/ui/Text.view'

export function GainCell({
  value,
  pct,
}: {
  value: number | null
  pct?: number | null
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (value == null) return <Text tone="subtle">—</Text>
  return (
    <Text tone={getGainTone(value)}>
      {formatMoney(value)}
      {pct != null && (
        <Text variant="secondaryCaption" className="ml-1">
          {formatPercentage(pct, { decimals: 2, signed: true })}
        </Text>
      )}
    </Text>
  )
}
