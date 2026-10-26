import { calculateGainTaxDetails } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculateGainTaxDetails'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout, Stack } from '@/shared/ui/Layout.view'
import { Text } from '@/shared/ui/Text.view'

import { GainCell } from './GainCell.view'

export function UnrealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.unrealized_gain
  const net = position.unrealized_gain_net
  const taxRate = position.tax_rate
  if (gross == null) return <Text tone="subtle">—</Text>
  const taxDetails = calculateGainTaxDetails(gross, net, taxRate)
  const isTaxFreeGain = taxRate === 0 && gross !== 0
  return (
    <Text variant="compact">
      <Stack as="span">
        <GainCell value={gross} pct={position.unrealized_gain_pct} />
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
