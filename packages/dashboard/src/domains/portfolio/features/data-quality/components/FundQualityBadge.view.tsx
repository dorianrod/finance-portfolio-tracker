import {
  FUND_QUALITY_LABELS,
  getFundQualityPresentation,
} from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation'
import type {
  FundHoldingStatus,
  FundQualityTier,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

const TIER_CLASSES: Record<FundQualityTier, string> = {
  A: 'border-positive bg-positive-muted/60 text-positive',
  B: 'border-accent bg-accent-muted/60 text-accent',
  C: 'border-warning bg-warning-muted/60 text-warning',
  D: 'border-danger bg-danger-muted/60 text-danger',
}

export function FundQualityBadge({ status }: { status: FundHoldingStatus }) {
  const formatPercentage = useFormatPercentage()
  const warning = status.validationStatus !== 'ok' || status.isStale
  const { category, sourceLabel } = getFundQualityPresentation(
    status.qualityTier,
  )
  const title = [
    i18n.t('ui.fundqualitybadge.qualityAndSource', {
      quality: FUND_QUALITY_LABELS[category],
      source: sourceLabel,
    }),
    status.sourceName || i18n.t('ui.fundqualitybadge.noSource'),
    i18n.t('ui.fundqualitybadge.explainedPercentage', {
      percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
    }),
    status.holdingsDate
      ? i18n.t('ui.fundqualitybadge.compositionDate', {
          date: status.holdingsDate,
        })
      : i18n.t('ui.fundqualitybadge.unknownCompositionDate'),
    status.issues,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TIER_CLASSES[status.qualityTier]}`}
    >
      {FUND_QUALITY_LABELS[category]}
      <span className="font-normal opacity-80">
        {formatPercentage(status.explainedPct)}
      </span>
      {warning && (
        <span aria-label={i18n.t('ui.fundqualitybadge.dataWarning')}>!</span>
      )}
    </span>
  )
}
