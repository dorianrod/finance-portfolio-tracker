import type { FundHoldingStatus, FundQualityTier } from '@/domains/portfolio/apis/queries/useFundHoldings'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import {
  FUND_QUALITY_LABELS,
  getFundQualityPresentation,
} from './helpers/presenters/getFundQualityPresentation'

const TIER_CLASSES: Record<FundQualityTier, string> = {
  A: 'border-emerald-700 bg-emerald-950/60 text-emerald-300',
  B: 'border-blue-700 bg-blue-950/60 text-blue-300',
  C: 'border-amber-700 bg-amber-950/60 text-amber-300',
  D: 'border-red-800 bg-red-950/60 text-red-300',
}

export function FundQualityBadge({ status }: { status: FundHoldingStatus }) {
  const formatPercentage = useFormatPercentage()
  const warning = status.validationStatus !== 'ok' || status.isStale
  const { category, sourceLabel } = getFundQualityPresentation(status.qualityTier)
  const title = [
    `${FUND_QUALITY_LABELS[category]} : ${sourceLabel}`,
    status.sourceName || 'Aucune source',
    `${formatPercentage(status.explainedPct, { unit: ' %' })} expliqué`,
    status.holdingsDate ? `composition du ${status.holdingsDate}` : 'date de composition inconnue',
    status.issues,
  ].filter(Boolean).join(' · ')
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TIER_CLASSES[status.qualityTier]}`}
    >
      {FUND_QUALITY_LABELS[category]}
      <span className="font-normal opacity-80">{formatPercentage(status.explainedPct)}</span>
      {warning && <span aria-label="Data warning">!</span>}
    </span>
  )
}
