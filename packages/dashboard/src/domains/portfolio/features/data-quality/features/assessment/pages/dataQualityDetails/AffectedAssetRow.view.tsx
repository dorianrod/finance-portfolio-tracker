import { type AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AffectedDimensionBadge } from './AffectedDimensionBadge.view'

export function AffectedAssetRow({ asset }: { asset: AffectedAsset }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface as="tr" variant="topAlignedRow">
      <Inset as="td" inset="default">
        <Text as="div" variant="medium" tone="secondary">
          {asset.name}
        </Text>
        <Layout spaceBefore="compact">
          <Text as="div" variant="tinyCode" tone="subtle" wrap="anywhere">
            {asset.id}
          </Text>
        </Layout>
      </Inset>
      <Inset as="td" inset="default">
        <Inline as="div" flow="wrap" gap="compact">
          {asset.dimensions.map((dimension) => (
            <AffectedDimensionBadge key={dimension} dimension={dimension} />
          ))}
        </Inline>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" align="right" numeric>
          <Text as="div" variant="medium" tone="warning">
            {formatMoney(asset.largestGapValue, { style: 'full' })}
          </Text>
          <Layout spaceBefore="compact">
            <Text as="div" variant="tiny" tone="subtle">
              {formatPercentage(asset.largestGapPct)}
            </Text>
          </Layout>
        </Text>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" variant="medium" tone="secondary" align="right" numeric>
          {formatMoney(asset.value, { style: 'full' })}
        </Text>
      </Inset>
    </Surface>
  )
}
