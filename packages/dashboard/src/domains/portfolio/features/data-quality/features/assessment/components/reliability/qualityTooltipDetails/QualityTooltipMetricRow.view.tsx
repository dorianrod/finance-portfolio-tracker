import { RELIABILITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import type { QualityTooltipRow } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/types/qualityTooltipRow.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function QualityTooltipMetricRow({ row }: { row: QualityTooltipRow }) {
  const rowStyles = RELIABILITY_TONES[row.tone]
  return (
    <Inline
      as="div"
      align="center"
      justify="between"
      gap="relaxed"
      inset="tooltipRow"
    >
      <Inline as="span" align="center" gap="default" sizing="flexible">
        <Layout
          as="span"
          flow="inline"
          height="track"
          width="track"
          sizing="fixed"
        >
          <ToneSwatch tone={rowStyles.dot} shape="dot" />
        </Layout>
        <Text variant="micro" tone="secondary">
          {row.label}
        </Text>
      </Inline>
      <Layout as="span" flow="inline" sizing="fixed">
        <Text align="right">
          <Text variant="captionStrong" tone={rowStyles.value} numeric>
            <Layout as="span" flow="block">
              {row.value}
            </Layout>
          </Text>
          {row.secondary && (
            <Layout as="span" flow="block" spaceBefore="compact">
              <Text variant="tiny" tone="subtle" numeric>
                <Layout as="span" flow="block">
                  {row.secondary}
                </Layout>
              </Text>
            </Layout>
          )}
        </Text>
      </Layout>
    </Inline>
  )
}
