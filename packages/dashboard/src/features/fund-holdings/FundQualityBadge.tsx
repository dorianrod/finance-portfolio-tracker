import type { FundHoldingStatus, FundQualityTier } from '@/hooks/useFundHoldings'
import {
  FUND_QUALITY_LABELS,
  fundQualityCategory,
  fundQualitySourceLabel,
} from './fundHoldings.logic'

const TIER_CLASSES: Record<FundQualityTier, string> = {
  A: 'border-emerald-700 bg-emerald-950/60 text-emerald-300',
  B: 'border-blue-700 bg-blue-950/60 text-blue-300',
  C: 'border-amber-700 bg-amber-950/60 text-amber-300',
  D: 'border-red-800 bg-red-950/60 text-red-300',
}

export function FundQualityBadge({ status }: { status: FundHoldingStatus }) {
  const warning = status.validationStatus !== 'ok' || status.isStale
  const category = fundQualityCategory(status.qualityTier)
  const title = [
    `${FUND_QUALITY_LABELS[category]} : ${fundQualitySourceLabel(status.qualityTier)}`,
    status.sourceName || 'Aucune source',
    `${status.explainedPct.toFixed(1)} % expliqué`,
    status.holdingsDate ? `composition du ${status.holdingsDate}` : 'date de composition inconnue',
    status.issues,
  ].filter(Boolean).join(' · ')
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TIER_CLASSES[status.qualityTier]}`}
    >
      {FUND_QUALITY_LABELS[category]}
      <span className="font-normal opacity-80">{status.explainedPct.toFixed(0)}%</span>
      {warning && <span aria-label="Data warning">!</span>}
    </span>
  )
}
