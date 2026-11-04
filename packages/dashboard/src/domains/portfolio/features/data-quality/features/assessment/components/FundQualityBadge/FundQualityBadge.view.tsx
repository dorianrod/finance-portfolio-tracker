import { useFormatFundQualityLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityLabel'
import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { BadgeTone } from '@/shared/ui/badge/badge.types'
import { Badge } from '@/shared/ui/badge/Badge.view'
import { NamedSymbol } from '@/shared/ui/controls/NamedSymbol.view'

import { useFormatFundQualityTitle } from './helpers/formatters/useFormatFundQualityTitle'

export function FundQualityBadge({ status }: { status: FundHoldingStatus }) {
  const formatFundQualityTitle = useFormatFundQualityTitle()
  const formatPercentage = useFormatPercentage()
  const formatQualityLabel = useFormatFundQualityLabel()
  const warning = status.validationStatus !== 'ok' || status.isStale
  return (
    <Badge
      title={formatFundQualityTitle(status)}
      tone={TIER_TONES[status.qualityTier]}
    >
      {formatQualityLabel(status.qualityTier)}
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
