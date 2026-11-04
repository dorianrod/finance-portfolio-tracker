import type { HoldingConcentration } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function ConcentrationTooltip({
  active,
  payload,
}: ConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0].payload
  return (
    <Surface variant="tooltip">
      <Text as="div" variant="strong" tone="default">
        {row.name}
      </Text>
      <Layout spaceBefore="compact">
        <Text as="div" tone="secondary">
          {formatMoney(row.value, { style: 'full' })} ·{' '}
          {formatPercentage(row.weight)}
        </Text>
      </Layout>
    </Surface>
  )
}

export type ConcentrationTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HoldingConcentration }>
}
