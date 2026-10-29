import { useFormatExposureSourceLabel } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/formatters/useFormatExposureSourceLabel'
import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function SourceTooltipRow({
  source,
  total,
}: {
  source: ExposureSource
  total: number
}) {
  const formatMoney = useFormatMoney()
  const formatSourceLabel = useFormatExposureSourceLabel()
  const formatPercentage = useFormatPercentage()
  return (
    <Inline as="li" align="baseline" gap="default">
      <Layout as="span" flow="inline" sizing="flexible">
        <Text tone="secondary" truncate>
          {formatSourceLabel(source)}
        </Text>
      </Layout>
      <Text tone="muted" numeric>
        {formatMoney(source.value, { style: 'full' })}
      </Text>
      <Layout as="span" flow="inline">
        <Text tone="subtle" align="right" numeric>
          {formatPercentage(total > 0 ? (source.value / total) * 100 : 0, {
            decimals: 0,
          })}
        </Text>
      </Layout>
    </Inline>
  )
}
