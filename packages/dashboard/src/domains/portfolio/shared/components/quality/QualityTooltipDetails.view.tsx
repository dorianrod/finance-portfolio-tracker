import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from './helpers/presenters/qualityReliabilityPresentation'

export function InfoIcon() {
  return (
    <Layout as="span" flow="inline" height="icon" width="icon">
      <Decorative variant="infoSymbol">
        <Inline as="span" align="center" justify="center">
          {i18n.t('ui.analysisreliabilitykpi.i')}
        </Inline>
      </Decorative>
    </Layout>
  )
}

export function QualityTooltipMetricRow({ row }: { row: QualityTooltipRow }) {
  const rowStyles = RELIABILITY_TONES[row.tone]
  return (
    <Inline
      as="span"
      align="center"
      justify="between"
      gap="relaxed"
      inset="compact"
    >
      <Inline as="span" align="center" gap="default">
        <Layout as="span" flow="inline" height="track" sizing="fixed">
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
