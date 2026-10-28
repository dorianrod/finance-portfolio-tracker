import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/getGainTone'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function GainCell({
  value,
  pct,
  zeroAsFallback = false,
}: {
  value: number | null
  pct?: number
  zeroAsFallback?: boolean
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const missing = value == null || (zeroAsFallback && value === 0)
  const showPercentage = !missing && pct != null
  return (
    <Text tone={missing ? 'subtle' : getGainTone(value)}>
      {formatMoney(value, { zeroAsFallback })}
      {showPercentage && (
        <Layout as="span" flow="inline">
          <Text variant="secondaryCaption">
            {formatPercentage(pct, { decimals: 2, signed: true })}
          </Text>
        </Layout>
      )}
    </Text>
  )
}
