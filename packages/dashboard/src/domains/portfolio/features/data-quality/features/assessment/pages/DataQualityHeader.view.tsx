import { DetailKpiButton } from '@/domains/portfolio/features/data-quality/features/assessment/pages/dataQualityDetails/DetailKpiButton.view'
import { QUALITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/pages/helpers/presenters/dataQualityToneStyles'
import type { QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/types/qualityTheme.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function DataQualityHeader({
  theme,
  action,
}: {
  theme: QualityTheme
  action: DetailAction | null
}) {
  return (
    <Layout spaceAfter="spacious">
      <Surface variant="sectionEnd">
        <Inline
          as="div"
          flow="wrap"
          align="start"
          gap="default"
          inset="default"
        >
          <Layout placement="leading">
            <Inline as="div" align="center" gap="default">
              <Layout as="span" flow="block" height="icon" sizing="fixed">
                <Surface as="span" variant="statusCanvasFrame">
                  <Inline as="span" align="center" justify="center">
                    <Layout
                      as="span"
                      flow="inline"
                      height="indicator"
                      width="indicator"
                    >
                      <ToneSwatch
                        tone={QUALITY_TONES[theme.tone]}
                        shape="dot"
                      />
                    </Layout>
                  </Inline>
                </Surface>
              </Layout>
              <Text as="h2" variant="heading" tone="default">
                {theme.label}
              </Text>
            </Inline>
            <Layout spaceBefore="compact">
              <Text as="p" variant="helper" tone="subtle">
                {theme.description}
              </Text>
            </Layout>
          </Layout>
          <Layout sizing="fixed">
            {action ? (
              <DetailKpiButton
                theme={theme}
                actionLabel={action.label}
                detailLabel={action.detail}
                expanded={action.expanded}
                onClick={action.onClick}
              />
            ) : (
              <Layout placement="inset" overflow="clip">
                <Surface variant="insetStatistic" align="right">
                  <Layout
                    as="span"
                    flow="inline"
                    placement="overlay"
                    width="divider"
                  >
                    <ToneSwatch
                      tone={QUALITY_TONES[theme.tone]}
                      shape="sideAccent"
                    />
                  </Layout>
                  <Text as="div" variant="compactMetric" tone="default" numeric>
                    {theme.metric}
                  </Text>
                  <Layout spaceBefore="default">
                    <Text as="div" variant="eyebrowLabel" tone="subtle">
                      {theme.metricLabel}
                    </Text>
                  </Layout>
                </Surface>
              </Layout>
            )}
          </Layout>
        </Inline>
      </Surface>
    </Layout>
  )
}

type DetailAction = {
  label: string
  detail: string
  expanded: boolean
  onClick: () => void
}
