import { navigateQualityTabs } from './helpers/presenters/navigateQualityTabs'
import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/helpers/formatters/dataQualityDimensionLabels'
import {
  type AffectedAsset,
  type QualityTheme,
} from '@/domains/portfolio/features/data-quality/helpers/mappers/buildDataQualityViewModel'
import { TONE_STYLES } from '@/domains/portfolio/features/data-quality/pages/helpers/presenters/dataQualityToneStyles'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function QualityThemeOption({ theme }: { theme: QualityTheme }) {
  return (
    <option value={theme.id}>
      {theme.label} · {theme.metric} {theme.metricLabel}
    </option>
  )
}

export function QualityThemeTab({
  activeThemeId,
  onSelect,
  theme,
}: {
  activeThemeId: QualityThemeId
  onSelect: (theme: QualityThemeId) => void
  theme: QualityTheme
}) {
  const active = theme.id === activeThemeId
  const styles = TONE_STYLES[theme.tone]
  return (
    <button
      type="button"
      role="tab"
      id={`quality-theme-${theme.id}`}
      tabIndex={active ? 0 : -1}
      onKeyDown={navigateQualityTabs}
      aria-selected={active}
      aria-controls="quality-theme-panel"
      onClick={() => onSelect(theme.id)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${active ? 'bg-accent-muted/50' : 'hover:bg-surface'}`}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface ring-1 ring-border"
        aria-hidden="true"
      >
        <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium ${active ? 'text-content' : 'text-content-secondary'}`}
        >
          {theme.label}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-content-subtle">
          {theme.metricLabel}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-content">
        {theme.metric}
      </span>
    </button>
  )
}

export function AffectedAssetsTable({ assets }: { assets: AffectedAsset[] }) {
  if (assets.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-content-subtle">
        {i18n.t('ui.dataqualitytab.noAffectedAssetForThisScope')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 z-10 bg-surface text-content-subtle">
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-medium">{i18n.t('ui.dataqualitytab.asset')}</th>
            <th className="px-4 py-3 font-medium">
              {i18n.t('ui.dataqualitytab.affectedDimensions')}
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {i18n.t('ui.dataqualitytab.largestGap')}
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {i18n.t('ui.dataqualitytab.positionValue')}
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <AffectedAssetRow key={asset.id} asset={asset} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AffectedDimensionBadge({
  dimension,
}: {
  dimension: AffectedAsset['dimensions'][number]
}) {
  return (
    <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-content-muted">
      {DATA_QUALITY_DIMENSION_LABELS[dimension]}
    </span>
  )
}

export function AffectedAssetRow({ asset }: { asset: AffectedAsset }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <tr className="border-b border-border/70 align-top hover:bg-canvas/40">
      <td className="px-4 py-3">
        <div className="font-medium text-content-secondary">{asset.name}</div>
        <div className="mt-1 break-all font-mono text-[10px] text-content-subtle">{asset.id}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {asset.dimensions.map((dimension) => (
            <AffectedDimensionBadge key={dimension} dimension={dimension} />
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        <div className="font-medium text-warning">
          {formatMoney(asset.largestGapValue, { style: 'full' })}
        </div>
        <div className="mt-1 text-[10px] text-content-subtle">
          {formatPercentage(asset.largestGapPct)}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums text-content-secondary">
        {formatMoney(asset.value, { style: 'full' })}
      </td>
    </tr>
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
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={`${actionLabel}: ${theme.metric} ${theme.metricLabel}, ${detailLabel}`}
      className="group relative flex min-w-[19rem] items-center gap-4 overflow-hidden rounded-md bg-canvas/70 px-5 py-4 text-left text-content transition-colors hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-focus/70"
    >
      <span
        className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full ${TONE_STYLES[theme.tone].accent}`}
        aria-hidden="true"
      />
      <span>
        <span className="block text-2xl font-semibold tabular-nums leading-none tracking-tight">
          {theme.metric}
        </span>
        <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-wider text-content-subtle">
          {theme.metricLabel}
        </span>
      </span>
      <span className="ml-auto flex items-center gap-3 border-l border-border pl-4">
        <span>
          <span className="block text-xs font-semibold text-accent">{actionLabel}</span>
          <span className="mt-0.5 block text-[10px] text-content-subtle">{detailLabel}</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-muted/60 text-accent">
          <svg
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.22 14.78a.75.75 0 0 1 0-1.06L10.94 10 7.22 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </span>
    </button>
  )
}

export function EmptyQualityState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-canvas/30 px-4 py-8 text-center text-sm text-content-subtle">
      {message}
    </div>
  )
}
