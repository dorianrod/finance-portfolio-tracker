import { useFormatExposureSourceLabel } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/formatters/useFormatExposureSourceLabel'
import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'
import { Tooltip } from '@/shared/ui/Tooltip.view'

import { SourcesTooltip } from './SourcesTooltip.view'

export function SourcesCell({
  sources,
  total,
  empty,
  compact = false,
}: {
  sources: ExposureSource[]
  total: number
  empty: string
  compact?: boolean
}) {
  const formatNumber = useFormatNumber()
  const formatSourceLabel = useFormatExposureSourceLabel()
  if (sources.length <= 1) {
    return (
      <Text
        tone="subtle"
        variant={compact ? 'caption' : 'inherit'}
        truncate
        title={formatSourceLabel(sources[0], { fallback: empty })}
      >
        {formatSourceLabel(sources[0], { fallback: empty })}
      </Text>
    )
  }
  return (
    <Tooltip>
      <Layout as="span" flow="inline" width="content">
        <Tooltip.Trigger variant="source">
          <Text tone="subtle" variant={compact ? 'caption' : 'inherit'}>
            {i18n.t('ui.fundholdingsexplorer.sourceCount', {
              count: sources.length,
              formattedCount: formatNumber(sources.length),
            })}
          </Text>
        </Tooltip.Trigger>
      </Layout>
      <Tooltip.Content>
        <SourcesTooltip sources={sources} total={total} />
      </Tooltip.Content>
    </Tooltip>
  )
}
