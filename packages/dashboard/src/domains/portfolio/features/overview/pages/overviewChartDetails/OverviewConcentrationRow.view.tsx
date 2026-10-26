import type { OverviewConcentrationRowData } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { PlotMarker } from '@/shared/ui/proportion/PlotMarker.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function OverviewConcentrationRow({
  previousAvailable,
  row,
  scaleMax,
}: {
  previousAvailable: boolean
  row: OverviewConcentrationRowData
  scaleMax: number
}) {
  const formatPercentage = useFormatPercentage()
  const delta =
    row.previousWeight == null ? null : row.weight - row.previousWeight
  let deltaTone: TextTone = 'subtle'
  if (delta != null && delta > 0) deltaTone = 'negative'
  else if (delta != null && delta < 0) deltaTone = 'positive'
  return (
    <div>
      <Layout spaceAfter="default">
        <Text as="div" variant="caption">
          <Inline as="div" align="center" gap="default">
            <Layout as="span" flow="inline" sizing="flexible">
              <Text variant="medium" tone="secondary" truncate title={row.name}>
                {row.label}
              </Text>
            </Layout>
            <Layout as="span" flow="inline" sizing="fixed">
              <Text tone="secondary" numeric>
                {formatPercentage(row.weight)}
              </Text>
            </Layout>
            <Layout as="span" flow="inline" sizing="fixed">
              <Text variant="tinyLabel" tone={deltaTone} align="right" numeric>
                {formatPercentage(delta, { signed: true, unit: ' pp' })}
              </Text>
            </Layout>
          </Inline>
        </Text>
      </Layout>
      <Layout placement="inset" height="indicator">
        <Surface variant="annotatedTrack">
          <Proportion value={row.weight} total={scaleMax}>
            <ToneSwatch
              as="div"
              tone={'attention'}
              shape="dot"
              prominence="strong"
            />
          </Proportion>
          {previousAvailable && (
            <PlotMarker value={row.previousWeight ?? 0} total={scaleMax}>
              <ToneSwatch
                tone="secondary"
                shape="marker"
                title={i18n.t('ui.overviewcharts.previousValue0', {
                  value0: formatPercentage(row.previousWeight, { fallback: 0 }),
                })}
              ></ToneSwatch>
            </PlotMarker>
          )}
        </Surface>
      </Layout>
    </div>
  )
}
