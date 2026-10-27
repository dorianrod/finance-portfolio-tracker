import { type QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/useBuildDataQualityViewModel'
import { QUALITY_TONES } from '@/domains/portfolio/features/data-quality/features/assessment/pages/helpers/presenters/dataQualityToneStyles'
import { DialogButton } from '@/shared/ui/controls/DialogButton.view'
import { NextIcon } from '@/shared/ui/icons/NextIcon.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function DetailKpiButton({
  theme,
  actionLabel,
  detailLabel,
  expanded,
  onClick,
}: {
  theme: QualityTheme
  actionLabel: string
  detailLabel: string
  expanded: boolean
  onClick: () => void
}) {
  return (
    <Layout as="span" flow="control" placement="inset">
      <DialogButton
        type="button"
        onClick={onClick}
        expanded={expanded}
        label={`${actionLabel}: ${theme.metric} ${theme.metricLabel}, ${detailLabel}`}
        variant="insetSummary"
      >
        <Layout as="span" flow="inline" placement="overlay" width="divider">
          <ToneSwatch tone={QUALITY_TONES[theme.tone]} shape="sideAccent" />
        </Layout>
        <span>
          <Text variant="prominentMetric" numeric>
            <Layout as="span" flow="block">
              {theme.metric}
            </Layout>
          </Text>
          <Layout as="span" flow="block" spaceBefore="default">
            <Text variant="eyebrowLabel" tone="subtle">
              <Layout as="span" flow="block">
                {theme.metricLabel}
              </Layout>
            </Text>
          </Layout>
        </span>
        <Layout as="span" flow="block" placement="trailing">
          <Surface as="span" variant="sectionInset">
            <Inline as="span" align="center" gap="default" inset="default">
              <span>
                <Text variant="captionStrong" tone="accent">
                  <Layout as="span" flow="block">
                    {actionLabel}
                  </Layout>
                </Text>
                <Layout as="span" flow="block" spaceBefore="compact">
                  <Text variant="tiny" tone="subtle">
                    <Layout as="span" flow="block">
                      {detailLabel}
                    </Layout>
                  </Text>
                </Layout>
              </span>
              <Layout as="span" flow="block" height="icon">
                <Surface as="span" variant="accentFill" tone="accent">
                  <Inline as="span" align="center" justify="center">
                    <NextIcon />
                  </Inline>
                </Surface>
              </Layout>
            </Inline>
          </Surface>
        </Layout>
      </DialogButton>
    </Layout>
  )
}
