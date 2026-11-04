import { GainCell } from '@/domains/portfolio/features/holdings/features/positions/components/GainCell.view'
import { calculateGainTaxDetails } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/calculateGainTaxDetails'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

export function UnrealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.unrealized_gain
  const net = position.unrealized_gain_net
  const taxRate = position.tax_rate
  if (gross == null) return <GainCell value={gross} />
  const taxDetails = calculateGainTaxDetails(gross, net, taxRate)
  const isTaxFreeGain = taxRate === 0 && gross !== 0
  return (
    <Text variant="compact">
      <Stack as="span" gap="none">
        <GainCell
          value={gross}
          pct={position.unrealized_gain_pct ?? undefined}
        />
        {taxDetails && (
          <Layout as="span" flow="inline" spaceBefore="compact">
            <Text variant="tiny" tone="subtle">
              {i18n.t('ui.gaincells.taxWithValues', {
                amount: formatMoney(-taxDetails.amount),
                percentage: formatPercentage(taxDetails.rate * 100, {
                  decimals: 0,
                }),
              })}
            </Text>
          </Layout>
        )}
        {isTaxFreeGain && (
          <Layout as="span" flow="inline" spaceBefore="compact">
            <Text variant="tiny" tone="subtle">
              {i18n.t('ui.gaincells.net0Tax')}
            </Text>
          </Layout>
        )}
      </Stack>
    </Text>
  )
}
