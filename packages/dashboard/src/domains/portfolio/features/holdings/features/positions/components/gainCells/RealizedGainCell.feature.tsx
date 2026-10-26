import { GainCell } from '@/domains/portfolio/features/holdings/features/positions/components/GainCell.view'
import { calculateGainTaxDetails } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculateGainTaxDetails'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

export function RealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.realized_gain
  const net = position.realized_gain_net
  const taxRate = position.tax_rate
  if (!gross) return <Text tone="subtle">—</Text>
  const taxDetails = calculateGainTaxDetails(gross, net, taxRate)
  const isTaxFreeGain = taxRate === 0 && gross > 0
  return (
    <Text variant="compact">
      <Stack as="span">
        <GainCell value={gross} />
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
