import { FUND_QUALITY_LABELS } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/fundQualityLabels'
import { getFundQualityPresentation } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { HierarchyIcon } from '@/shared/ui/icons/HierarchyIcon.view'
import { Preview } from '@/shared/ui/Preview.view'

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
  const { category, sourceLabel } = getFundQualityPresentation(
    status.qualityTier,
  )
  const label = FUND_QUALITY_LABELS[category]
  const title = i18n.t('ui.positionstable.fundQualitySummary', {
    label,
    source: sourceLabel,
    percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
  })
  const tone = {
    reliable: 'positive',
    partial: 'warning',
    unavailable: 'negative',
  }[category] as 'positive' | 'warning' | 'negative'

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
      tone={tone}
      selected={isOpen}
      onPreview={onShow}
      onDismiss={onHide}
    >
      <HierarchyIcon />
    </Preview.Trigger>
  )
}
