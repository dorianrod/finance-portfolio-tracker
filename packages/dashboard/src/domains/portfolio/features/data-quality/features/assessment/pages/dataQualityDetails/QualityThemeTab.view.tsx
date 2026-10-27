import { type QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/useBuildDataQualityViewModel'
import { QUALITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/pages/helpers/presenters/dataQualityToneStyles'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Tabs } from '@/shared/ui/Tabs.view'
import { Text } from '@/shared/ui/Text.view'

export function QualityThemeTab({
  activeThemeId,
  theme,
}: {
  activeThemeId: QualityThemeId
  theme: QualityTheme
}) {
  const active = theme.id === activeThemeId
  const styles = QUALITY_TONES[theme.tone]
  return (
    <Layout as="span" flow="control" width="full">
      <Tabs.Trigger value={theme.id} variant="stacked" selected={active}>
        <Layout as="span" flow="block" height="icon" sizing="fixed">
          <Surface as="span" variant="statusFrame">
            <Inline as="span" align="center" justify="center">
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <ToneSwatch tone={styles} shape="dot" />
              </Layout>
            </Inline>
          </Surface>
        </Layout>
        <Layout as="span" sizing="flexible">
          <Text variant="label" tone={active ? 'default' : 'secondary'}>
            <Layout as="span" flow="block">
              {theme.label}
            </Layout>
          </Text>
          <Layout as="span" flow="block" spaceBefore="compact">
            <Text variant="micro" tone="subtle" truncate>
              <Layout as="span" flow="block">
                {theme.metricLabel}
              </Layout>
            </Text>
          </Layout>
        </Layout>
        <Layout as="span" flow="inline" sizing="fixed">
          <Text variant="bodyStrong" tone="default" numeric>
            {theme.metric}
          </Text>
        </Layout>
      </Tabs.Trigger>
    </Layout>
  )
}
