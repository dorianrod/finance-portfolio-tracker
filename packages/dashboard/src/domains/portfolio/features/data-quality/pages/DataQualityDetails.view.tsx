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
    <Tabs.Trigger
      value={theme.id}
      variant="quality"
      selected={active}
      className="flex w-full items-center gap-3 px-3 py-3"
    >
      <Surface
        as="span"
        variant="statusFrame"
        className="flex h-5 w-5 shrink-0 items-center justify-center"
      >
        <ToneSwatch tone={styles} shape="dot" className="h-2 w-2" />
      </Surface>
      <span className="min-w-0 flex-1">
        <Text
          variant="label"
          tone={active ? 'default' : 'secondary'}
          className="block"
        >
          {theme.label}
        </Text>
        <Text variant="micro" tone="subtle" truncate className="mt-0.5 block">
          {theme.metricLabel}
        </Text>
      </span>
      <Text variant="bodyStrong" tone="default" numeric className="shrink-0">
        {theme.metric}
      </Text>
    </Tabs.Trigger>
  )
}

export function AffectedAssetsTable({ assets }: { assets: AffectedAsset[] }) {
  if (assets.length === 0) {
    return (
      <Text as="p" variant="body" tone="subtle" align="center" className="p-6">
        {i18n.t('ui.dataqualitytab.noAffectedAssetForThisScope')}
      </Text>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Surface
        variant="compactTable"
        as="table"
        align="left"
        className="w-full"
      >
        <Surface
          as="thead"
          variant="plain"
          tone="subtle"
          className="sticky top-0 z-10"
        >
          <Surface as="tr" variant="sectionEnd">
            <Text as="th" variant="medium" className="px-4 py-3">
              {i18n.t('ui.dataqualitytab.asset')}
            </Text>
            <Text as="th" variant="medium" className="px-4 py-3">
              {i18n.t('ui.dataqualitytab.affectedDimensions')}
            </Text>
            <Text as="th" variant="medium" align="right" className="px-4 py-3">
              {i18n.t('ui.dataqualitytab.largestGap')}
            </Text>
            <Text as="th" variant="medium" align="right" className="px-4 py-3">
              {i18n.t('ui.dataqualitytab.positionValue')}
            </Text>
          </Surface>
        </Surface>
        <tbody>
          {assets.map((asset) => (
            <AffectedAssetRow key={asset.id} asset={asset} />
          ))}
        </tbody>
      </Surface>
    </div>
  )
}

export function AffectedDimensionBadge({
  dimension,
}: {
  dimension: AffectedAsset['dimensions'][number]
}) {
  return (
    <Surface
      as="span"
      variant="quietChip"
      tone="muted"
      className="px-1.5 py-0.5"
    >
      {DATA_QUALITY_DIMENSION_LABELS[dimension]}
    </Surface>
  )
}

export function AffectedAssetRow({ asset }: { asset: AffectedAsset }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface as="tr" variant="topAlignedRow">
      <td className="px-4 py-3">
        <Text as="div" variant="medium" tone="secondary">
          {asset.name}
        </Text>
        <Text
          as="div"
          variant="tinyCode"
          tone="subtle"
          wrap="anywhere"
          className="mt-1"
        >
          {asset.id}
        </Text>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {asset.dimensions.map((dimension) => (
            <AffectedDimensionBadge key={dimension} dimension={dimension} />
          ))}
        </div>
      </td>
      <Text as="td" align="right" numeric className="px-4 py-3">
        <Text as="div" variant="medium" tone="warning">
          {formatMoney(asset.largestGapValue, { style: 'full' })}
        </Text>
        <Text as="div" variant="tiny" tone="subtle" className="mt-1">
          {formatPercentage(asset.largestGapPct)}
        </Text>
      </Text>
      <Text
        as="td"
        variant="medium"
        tone="secondary"
        align="right"
        numeric
        className="px-4 py-3"
      >
        {formatMoney(asset.value, { style: 'full' })}
      </Text>
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
    <DialogButton
      type="button"
      onClick={onClick}
      expanded={expanded}
      label={`${actionLabel}: ${theme.metric} ${theme.metricLabel}, ${detailLabel}`}
      variant="qualitySummary"
      className="relative flex min-w-[19rem] items-center gap-4 px-5 py-4"
    >
      <ToneSwatch
        tone={QUALITY_TONES[theme.tone]}
        shape="sideAccent"
        className="absolute inset-y-2 left-0 w-0.5"
      />
      <span>
        <Text variant="prominentMetric" numeric className="block">
          {theme.metric}
        </Text>
        <Text variant="eyebrowLabel" tone="subtle" className="mt-1.5 block">
          {theme.metricLabel}
        </Text>
      </span>
      <Surface
        as="span"
        variant="sectionInset"
        className="ml-auto flex items-center gap-3 pl-4"
      >
        <span>
          <Text variant="captionStrong" tone="accent" className="block">
            {actionLabel}
          </Text>
          <Text variant="tiny" tone="subtle" className="mt-0.5 block">
            {detailLabel}
          </Text>
        </span>
        <Surface
          as="span"
          variant="accentFill"
          tone="accent"
          className="flex h-7 w-7 items-center justify-center"
        >
          <NextIcon />
        </Surface>
      </Surface>
    </DialogButton>
  )
}

export function EmptyQualityState({ message }: { message: string }) {
  return (
    <Surface
      variant="insetContent"
      tone="subtle"
      align="center"
      className="px-4 py-8"
    >
      {message}
    </Surface>
  )
}
