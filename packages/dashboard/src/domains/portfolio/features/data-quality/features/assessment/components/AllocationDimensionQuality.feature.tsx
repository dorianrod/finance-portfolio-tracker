import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverage.types'
import { getUnclassifiedAllocationPercentage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/getUnclassifiedAllocationPercentage'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/qualityThresholds/hasMaterialQualityGap'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/features/assessment/services/actions/useDataQualityClassificationDetails'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function AllocationDimensionQuality({
  coverage,
}: {
  coverage: DimensionCoverage[]
}) {
  return (
    <Stack gap="relaxed">
      {coverage.map((item) => (
        <AllocationDimensionRow key={item.dimension} item={item} />
      ))}
    </Stack>
  )
}

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: i18n.t('ui.allocationdimensionquality.geography'),
  secteur: i18n.t('ui.allocationdimensionquality.sector'),
  currency: i18n.t('ui.allocationdimensionquality.currency'),
  classe: i18n.t('ui.allocationdimensionquality.assetClass'),
}

function AllocationDimensionRow({ item }: { item: DimensionCoverage }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { openClassificationDetails } = useDataQualityClassificationDetails()
  const missingPct = getUnclassifiedAllocationPercentage(item)
  const materialGap = hasMaterialQualityGap(missingPct)
  const label = LABELS[item.dimension]

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
        <Button
          type="button"
          onClick={() => openClassificationDetails(item.dimension)}
          variant="dimensionDetail"
        >
          {i18n.t('ui.allocationdimensionquality.responsibleAssetCount', {
            count: item.issues.length,
          })}
        </Button>
      </Layout>
    </div>
  )
}
