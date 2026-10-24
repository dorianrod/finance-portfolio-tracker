import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'

export type FundQualityCategory = 'reliable' | 'partial' | 'unavailable'

export const FUND_QUALITY_LABELS: Record<FundQualityCategory, string> = {
  reliable: i18n.t('ui.getfundqualitypresentation.reliable'),
  partial: i18n.t('ui.getfundqualitypresentation.partial'),
  unavailable: i18n.t('ui.getfundqualitypresentation.unavailable'),
}

export function getFundQualityPresentation(tier: FundQualityTier): {
  category: FundQualityCategory
  label: string
  sourceLabel: string
} {
  let category: FundQualityCategory = 'unavailable'
  if (tier === 'A' || tier === 'B') category = 'reliable'
  else if (tier === 'C') category = 'partial'

  let sourceLabel = i18n.t('ui.getfundqualitypresentation.noUsableComposition')
  if (tier === 'A') sourceLabel = i18n.t('ui.getfundqualitypresentation.officialSource')
  else if (tier === 'B') sourceLabel = i18n.t('ui.getfundqualitypresentation.exactProxy')
  else if (tier === 'C') sourceLabel = i18n.t('ui.getfundqualitypresentation.partialSource')
  return { category, label: FUND_QUALITY_LABELS[category], sourceLabel }
}
