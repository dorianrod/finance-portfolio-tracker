import { useFormatFundQualityLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityLabel'
import { useFormatFundQualitySourceLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualitySourceLabel'
import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { HierarchyIcon } from '@/shared/ui/icons/HierarchyIcon.view'
import { Preview } from '@/shared/ui/Preview.view'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function UnderlyingStatusButton({
  status,
  assetName,
  isOpen,
  onShow,
  onHide,
}: {
  status: FundHoldingStatus
  assetName: string
  isOpen: boolean
  onShow: (button: HTMLButtonElement) => void
  onHide: () => void
}) {
  const formatPercentage = useFormatPercentage()
  const formatQualityLabel = useFormatFundQualityLabel()
  const formatSourceLabel = useFormatFundQualitySourceLabel()
  const title = i18n.t('ui.positionstable.fundQualitySummary', {
    label: formatQualityLabel(status.qualityTier),
    source: formatSourceLabel(status.qualityTier),
    percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
  })

  return (
    <Preview.Trigger
      type="button"
      label={
        isOpen
          ? i18n.t('ui.positionstable.hideCompositionForAsset', {
              title,
              assetName,
            })
          : i18n.t('ui.positionstable.showCompositionForAsset', {
              title,
              assetName,
            })
      }
      expanded={isOpen}
      title={
        isOpen
          ? i18n.t('ui.positionstable.hideComposition', { title })
          : i18n.t('ui.positionstable.showComposition', { title })
      }
      tone={TIER_TONES[status.qualityTier]}
      selected={isOpen}
      onPreview={onShow}
      onDismiss={onHide}
    >
      <HierarchyIcon />
    </Preview.Trigger>
  )
}

const TIER_TONES: Record<FundQualityTier, TextTone> = {
  A: 'positive',
  B: 'positive',
  C: 'warning',
  D: 'negative',
}
