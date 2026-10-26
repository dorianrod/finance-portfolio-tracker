import { FUND_QUALITY_LABELS } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/fundQualityLabels'
import { getFundQualityPresentation } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation'
import type {
  FundHoldingStatus,
  FundQualityTier,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { BadgeTone } from '@/shared/ui/badge/badge.types'
import { Badge } from '@/shared/ui/badge/Badge.view'
import { NamedSymbol } from '@/shared/ui/controls/NamedSymbol.view'

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
    <Badge title={title} tone={TIER_TONES[status.qualityTier]}>
      {FUND_QUALITY_LABELS[category]}
      <Badge.Detail>{formatPercentage(status.explainedPct)}</Badge.Detail>
      {warning && (
        <NamedSymbol label={i18n.t('ui.fundqualitybadge.dataWarning')}>
          !
        </NamedSymbol>
      )}
    </Badge>
  )
}

const TIER_TONES: Record<FundQualityTier, BadgeTone> = {
  A: 'positive',
  B: 'accent',
  C: 'warning',
  D: 'negative',
}
