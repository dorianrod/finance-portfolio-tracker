import { useFormatDataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatDataQualityDimension'
import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/dimensionCoverage.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function AllocationDimensionRowView({
  item,
  missingPct,
  materialGap,
  onOpenDetails,
}: {
  item: DimensionCoverage
  missingPct: number
  materialGap: boolean
  onOpenDetails: () => void
}) {
  const formatDimension = useFormatDataQualityDimension()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const label = formatDimension(item.dimension, { style: 'title' })
  return (
    <div>
      <Inline
        as="div"
        spaceAfter="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text variant="caption" tone="muted" truncate>
          {label}
        </Text>
        <Layout as="span" flow="inline" sizing="fixed">
          <Text
            variant="micro"
            numeric
            tone={materialGap ? 'warning' : 'positive'}
          >
            {formatMoney(item.unallocated, { style: 'full' })} ·{' '}
            {formatPercentage(missingPct)}
          </Text>
        </Layout>
      </Inline>
      <Layout height="track" overflow="clip">
        <Surface
          variant="track"
          title={i18n.t(
            'ui.allocationdimensionquality.value0NotClassifiedForValue1',
            {
              value0: formatPercentage(missingPct),
              value1: label.toLowerCase(),
            },
          )}
        >
          <Proportion value={Math.min(100, missingPct)}>
            <ToneSwatch
              as="div"
              shape="dot"
              tone={materialGap ? 'warning' : 'positive'}
            />
          </Proportion>
        </Surface>
      </Layout>
      <Layout as="span" flow="control" spaceBefore="default">
        <Button type="button" onClick={onOpenDetails} variant="dimensionDetail">
          {i18n.t('ui.allocationdimensionquality.responsibleAssetCount', {
            count: item.issues.length,
          })}
        </Button>
      </Layout>
    </div>
  )
}
