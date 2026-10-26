import i18n from '@/i18n/i18n'

import type { FundQualityCategory } from './getFundQualityPresentation.types'

export const FUND_QUALITY_LABELS: Record<FundQualityCategory, string> = {
  reliable: i18n.t('ui.getfundqualitypresentation.reliable'),
  partial: i18n.t('ui.getfundqualitypresentation.partial'),
  unavailable: i18n.t('ui.getfundqualitypresentation.unavailable'),
}
