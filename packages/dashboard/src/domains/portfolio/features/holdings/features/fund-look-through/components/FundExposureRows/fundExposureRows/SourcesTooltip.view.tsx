import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

import type { Source } from './fundExposureRows.types'
import { SourceTooltipRow } from './SourceTooltipRow.view'

export function SourcesTooltip({
  sources,
  total,
}: {
  sources: Source[]
  total: number
}) {
  const formatNumber = useFormatNumber()
  return (
    <div>
      <Layout spaceAfter="default">
        <Text as="div" variant="tinyOverline" tone="subtle">
          {i18n.t('ui.fundholdingsexplorer.heldThroughFunds', {
            count: sources.length,
            formattedCount: formatNumber(sources.length),
          })}
        </Text>
      </Layout>
      <Stack as="ul" gap="compact" overflow="clip">
        {sources.map((source) => (
          <SourceTooltipRow key={source.fund} source={source} total={total} />
        ))}
      </Stack>
    </div>
  )
}
