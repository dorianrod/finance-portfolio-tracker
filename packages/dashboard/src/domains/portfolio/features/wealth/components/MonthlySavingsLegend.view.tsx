import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'
import { Grid, Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

export function MonthlySavingsLegend() {
  return (
    <Layout spaceBefore="default">
      <Surface variant="captionFooter" tone="subtle">
        <Grid columns={2} gap="relaxed" inset="default">
          <div>
            <Layout spaceAfter="default">
              <Text as="div" variant="eyebrow" tone="subtle">
                {i18n.t('ui.monthlysavingschart.monthlyBars')}
              </Text>
            </Layout>
            <Stack gap="compact">
              <Inline as="div" align="center" gap="default">
                <Layout as="span" flow="inline" height="indicator" width="icon">
                  <SeriesSwatch
                    tone={PORTFOLIO_CHART_TONES.netContributions}
                    shape="bar"
                  />
                </Layout>
                <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
              </Inline>
              <Inline as="div" align="center" gap="default">
                <Layout
                  as="span"
                  flow="inline"
                  height="indicator"
                  width="icon"
                  overflow="clip"
                >
                  <Decorative variant="swatchFrame">
                    <Inline as="span">
                      <Layout
                        as="span"
                        flow="inline"
                        height="full"
                        width="half"
                      >
                        <SeriesSwatch
                          tone={PORTFOLIO_CHART_TONES.performancePositive}
                          as="i"
                        />
                      </Layout>
                      <Layout
                        as="span"
                        flow="inline"
                        height="full"
                        width="half"
                      >
                        <SeriesSwatch
                          tone={PORTFOLIO_CHART_TONES.performanceNegative}
                          as="i"
                        />
                      </Layout>
                    </Inline>
                  </Decorative>
                </Layout>
                <span>
                  {i18n.t('ui.monthlysavingschart.marketPerformance')}
                </span>
              </Inline>
            </Stack>
          </div>
          <div>
            <Layout spaceAfter="default">
              <Text as="div" variant="eyebrow" tone="subtle">
                {i18n.t('ui.monthlysavingschart.trailing12mLines')}
              </Text>
            </Layout>
            <Stack gap="compact">
              <Inline as="div" align="center" gap="default">
                <Layout as="span" flow="inline" height="divider" width="icon">
                  <SeriesSwatch tone={PORTFOLIO_CHART_TONES.netContributions} />
                </Layout>
                <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
              </Inline>
              <Inline as="div" align="center" gap="default">
                <Layout as="span" flow="inline" height="divider" width="icon">
                  <SeriesSwatch tone={PORTFOLIO_CHART_TONES.performance} />
                </Layout>
                <span>
                  {i18n.t('ui.monthlysavingschart.marketPerformance')}
                </span>
              </Inline>
            </Stack>
          </div>
        </Grid>
      </Surface>
    </Layout>
  )
}
