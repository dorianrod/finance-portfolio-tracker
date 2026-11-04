import { buildExposureSourceRows } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundExposureRows/helpers/presenters/buildExposureSourceRows'
import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

import { SourceTooltipRow } from './SourceTooltipRow.view'

export function SourcesTooltip({
  sources,
  total,
}: {
  sources: ExposureSource[]
  total: number
}) {
  const formatNumber = useFormatNumber()
  const rows = buildExposureSourceRows(sources)
  return (
    <div>
      <Layout spaceAfter="default">
        <Text as="div" variant="tinyOverline" tone="subtle">
          {i18n.t('ui.fundholdingsexplorer.heldThroughSources', {
            count: sources.length,
            formattedCount: formatNumber(sources.length),
          })}
        </Text>
      </Layout>
      <Stack as="ul" gap="compact" overflow="clip">
        {rows.map((row) => (
          <SourceTooltipRow key={row.key} source={row.source} total={total} />
        ))}
      </Stack>
    </div>
  )
}
