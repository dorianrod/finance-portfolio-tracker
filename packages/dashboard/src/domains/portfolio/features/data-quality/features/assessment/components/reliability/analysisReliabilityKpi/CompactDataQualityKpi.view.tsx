import type { ReactNode } from 'react'

import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation'
import { InfoIcon } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/qualityTooltipDetails/InfoIcon.view'
import { QualityTooltipMetricRow } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/qualityTooltipDetails/QualityTooltipMetricRow.view'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'
import { Tooltip } from '@/shared/ui/Tooltip.view'

export function CompactDataQualityKpiView({
  tone,
  tooltip,
  rows,
  ariaLabel,
  onOpenQuality,
  children,
}: {
  tone: AnalysisReliabilityTone
  tooltip: string
  rows: QualityTooltipRow[]
  ariaLabel: string
  onOpenQuality: () => void
  children: ReactNode
}) {
  const styles = RELIABILITY_TONES[tone]

  return (
    <Inline as="div" placement="inset">
      <Surface variant="splitAction">
        <Inline as="div" align="center">
          <Button
            type="button"
            onClick={onOpenQuality}
            variant="splitAction"
            label={ariaLabel}
          >
            <Text variant="prominentEyebrow" tone="subtle">
              {i18n.t('ui.analysisreliabilitykpi.dataQuality')}
            </Text>
            <Layout
              as="span"
              flow="inline"
              height="indicator"
              width="indicator"
              sizing="fixed"
            >
              <ToneSwatch tone={styles.dot} shape="dot" />
            </Layout>
            <Text variant="eyebrow" tone={styles.status}>
              {styles.label}
            </Text>
          </Button>
          <Tooltip>
            <Tooltip.Trigger
              variant="help"
              label={i18n.t('ui.analysisreliabilitykpi.showDataQualityDetails')}
            >
              <InfoIcon />
            </Tooltip.Trigger>
            <Tooltip.Content align="start" variant="left">
              <Text variant="note" tone="muted">
                <Layout as="span" flow="block">
                  {tooltip}
                </Layout>
              </Text>
              <Layout as="span" flow="block" spaceBefore="default">
                <Surface as="span" variant="sectionStart">
                  <Text variant="eyebrow" tone="subtle">
                    <Layout as="span" flow="block">
                      {i18n.t('ui.analysisreliabilitykpi.filterScope')}
                    </Layout>
                  </Text>
                  {children}
                </Surface>
              </Layout>
              <Layout as="span" flow="block" spaceBefore="default">
                <Surface as="span" variant="sectionStart">
                  {rows.map((row) => (
                    <QualityTooltipMetricRow key={row.label} row={row} />
                  ))}
                </Surface>
              </Layout>
            </Tooltip.Content>
          </Tooltip>
        </Inline>
      </Surface>
    </Inline>
  )
}
