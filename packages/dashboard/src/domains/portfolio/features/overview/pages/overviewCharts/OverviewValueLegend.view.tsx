import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function OverviewValueLegend() {
  return (
    <Text as="div" variant="micro" tone="subtle">
      <Inline as="div" align="center" gap="default">
        <Inline as="span" align="center" gap="compact">
          <Layout as="span" flow="inline" height="indicator" width="indicator">
            <ToneSwatch tone="subtle" shape="dot" />
          </Layout>
          {i18n.t('ui.overviewcharts.previous')}
        </Inline>
        <Inline as="span" align="center" gap="compact">
          <Layout as="span" flow="inline" height="indicator" width="indicator">
            <ToneSwatch tone={'highlight'} shape="dot" />
          </Layout>
          {i18n.t('ui.overviewcharts.current')}
        </Inline>
      </Inline>
    </Text>
  )
}
