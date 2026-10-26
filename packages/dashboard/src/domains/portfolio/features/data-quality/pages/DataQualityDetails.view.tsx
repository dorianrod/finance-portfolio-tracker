import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/helpers/formatters/dataQualityDimensionLabels'
import {
  type AffectedAsset,
  type QualityTheme,
} from '@/domains/portfolio/features/data-quality/helpers/mappers/buildDataQualityViewModel'
import { QUALITY_TONES } from '@/domains/portfolio/features/data-quality/pages/helpers/presenters/dataQualityToneStyles'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { DialogButton } from '@/shared/ui/Controls.view'
import { NextIcon } from '@/shared/ui/Icons.view'
import { Inline, Inset, Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Tabs } from '@/shared/ui/Tabs.view'
import { Text } from '@/shared/ui/Text.view'

export function QualityThemeOption({ theme }: { theme: QualityTheme }) {
  return (
    <option value={theme.id}>
      {theme.label} · {theme.metric} {theme.metricLabel}
    </option>
  )
}

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
      <Tabs.Trigger value={theme.id} variant="quality" selected={active}>
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

export function AffectedAssetsTable({ assets }: { assets: AffectedAsset[] }) {
  if (assets.length === 0) {
    return (
      <Text as="p" variant="body" tone="subtle" align="center">
        <Layout as="span" flow="block" inset="spacious">
          {i18n.t('ui.dataqualitytab.noAffectedAssetForThisScope')}
        </Layout>
      </Text>
    )
  }

  return (
    <Layout overflow="auto">
      <Surface variant="compactTable" as="table" align="left">
        <Surface as="thead" variant="plain" tone="subtle">
          <Surface as="tr" variant="sectionEnd">
            <Inset as="th" inset="default">
              <Text as="div" variant="medium">
                {i18n.t('ui.dataqualitytab.asset')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium">
                {i18n.t('ui.dataqualitytab.affectedDimensions')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium" align="right">
                {i18n.t('ui.dataqualitytab.largestGap')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium" align="right">
                {i18n.t('ui.dataqualitytab.positionValue')}
              </Text>
            </Inset>
          </Surface>
        </Surface>
        <tbody>
          {assets.map((asset) => (
            <AffectedAssetRow key={asset.id} asset={asset} />
          ))}
        </tbody>
      </Surface>
    </Layout>
  )
}

export function AffectedDimensionBadge({
  dimension,
}: {
  dimension: AffectedAsset['dimensions'][number]
}) {
  return (
    <Surface as="span" variant="quietChip" tone="muted">
      {DATA_QUALITY_DIMENSION_LABELS[dimension]}
    </Surface>
  )
}

export function AffectedAssetRow({ asset }: { asset: AffectedAsset }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface as="tr" variant="topAlignedRow">
      <Inset as="td" inset="default">
        <Text as="div" variant="medium" tone="secondary">
          {asset.name}
        </Text>
        <Layout spaceBefore="compact">
          <Text as="div" variant="tinyCode" tone="subtle" wrap="anywhere">
            {asset.id}
          </Text>
        </Layout>
      </Inset>
      <Inset as="td" inset="default">
        <Inline as="div" flow="wrap" gap="compact">
          {asset.dimensions.map((dimension) => (
            <AffectedDimensionBadge key={dimension} dimension={dimension} />
          ))}
        </Inline>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" align="right" numeric>
          <Text as="div" variant="medium" tone="warning">
            {formatMoney(asset.largestGapValue, { style: 'full' })}
          </Text>
          <Layout spaceBefore="compact">
            <Text as="div" variant="tiny" tone="subtle">
              {formatPercentage(asset.largestGapPct)}
            </Text>
          </Layout>
        </Text>
      </Inset>
      <Inset as="td" inset="default">
        <Text as="div" variant="medium" tone="secondary" align="right" numeric>
          {formatMoney(asset.value, { style: 'full' })}
        </Text>
      </Inset>
    </Surface>
  )
}

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
        variant="qualitySummary"
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

export function EmptyQualityState({ message }: { message: string }) {
  return (
    <Surface variant="insetContent" tone="subtle" align="center">
      {message}
    </Surface>
  )
}
